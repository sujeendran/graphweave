import { Node, Edge } from '@xyflow/react';
import { ServiceNodeData, ServiceType } from '@/store/useCanvasStore';

export type ViolationSeverity = 'critical' | 'warning' | 'info';

export type ViolationCategory =
  | 'SPOF'
  | 'Insecure_Transit'
  | 'Public_Exposure'
  | 'Performance_Bottleneck'
  | 'Topology_Hygiene'
  | 'Security_Vulnerability';

export interface ArchitectureViolation {
  id: string;
  ruleId: string;
  severity: ViolationSeverity;
  category: ViolationCategory;
  title: string;
  description: string;
  complianceImpact?: string;
  nodeIds: string[];
  edgeIds: string[];
  quickFix?: {
    label: string;
    actionType: 'add_replica' | 'upgrade_tls' | 'add_cache' | 'prune_node' | 'resolve_node_threat';
    targetId: string;
  };
}

export interface ArchitectureAuditReport {
  timestamp: string;
  healthScore: number;
  totalViolations: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  violations: ArchitectureViolation[];
}

export function evaluateArchitecture(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[]
): ArchitectureAuditReport {
  const violations: ArchitectureViolation[] = [];

  // Map incoming and outgoing edges per node
  const incomingEdgesMap = new Map<string, Edge[]>();
  const outgoingEdgesMap = new Map<string, Edge[]>();

  nodes.forEach((n) => {
    incomingEdgesMap.set(n.id, []);
    outgoingEdgesMap.set(n.id, []);
  });

  edges.forEach((e) => {
    const incoming = incomingEdgesMap.get(e.target);
    if (incoming) incoming.push(e);

    const outgoing = outgoingEdgesMap.get(e.source);
    if (outgoing) outgoing.push(e);
  });

  // RULE 1: Insecure Transit (Plaintext unencrypted connection)
  edges.forEach((edge) => {
    const isPlaintext = edge.data?.isEncrypted === false || edge.style?.stroke === '#f43f5e';
    if (isPlaintext) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceLabel = sourceNode?.data?.label || edge.source;
      const targetLabel = targetNode?.data?.label || edge.target;

      violations.push({
        id: `violation-plaintext-${edge.id}`,
        ruleId: 'RULE_PLAINTEXT_TRANSIT',
        severity: 'critical',
        category: 'Insecure_Transit',
        title: `Plaintext Channel: ${sourceLabel} → ${targetLabel}`,
        description: `Communication channel is unencrypted (${edge.label || 'Plaintext'}). Data in transit across network boundaries is vulnerable to eavesdropping and man-in-the-middle tampering.`,
        complianceImpact: 'Violates PCI-DSS Req 4.1, SOC2 CC6.1 & HIPAA Transport Encryption rules.',
        nodeIds: [edge.source, edge.target],
        edgeIds: [edge.id],
        quickFix: {
          label: 'Upgrade to TLS / mTLS',
          actionType: 'upgrade_tls',
          targetId: edge.id,
        },
      });
    }
  });

  // RULE 2: Single Point of Failure (SPOF) on Databases
  nodes.forEach((node) => {
    if (node.data.type === 'database') {
      const isReplica =
        node.id.includes('replica') ||
        node.data.label.toLowerCase().includes('replica') ||
        node.data.label.toLowerCase().includes('standby');

      // Replicas don't need their own replicas
      if (isReplica) return;

      const incoming = incomingEdgesMap.get(node.id) || [];
      const outgoing = outgoingEdgesMap.get(node.id) || [];

      // Check if there is an active replication link to another database or cluster
      const hasReplicaTarget = outgoing.some((e) => {
        const targetNode = nodes.find((n) => n.id === e.target);
        return (
          targetNode?.data?.type === 'database' ||
          targetNode?.id.includes('replica') ||
          targetNode?.data.label.toLowerCase().includes('replica')
        );
      });

      // If database receives traffic from compute or gateway services but has no replica
      const receivesTraffic = incoming.some((e) => {
        const src = nodes.find((n) => n.id === e.source);
        return src?.data.type === 'compute' || src?.data.type === 'gateway';
      });

      if (receivesTraffic && !hasReplicaTarget) {
        violations.push({
          id: `violation-spof-${node.id}`,
          ruleId: 'RULE_SPOF_DATABASE',
          severity: 'critical',
          category: 'SPOF',
          title: `Single Point of Failure: ${node.data.label}`,
          description: `Primary database has ${incoming.length} active service connection(s) but no secondary standby replica or failover cluster configured. Any node outage causes total system downtime.`,
          complianceImpact: 'Fails high-availability RTO/RPO SLAs (SOC2 CC9.1 Disaster Recovery).',
          nodeIds: [node.id],
          edgeIds: [],
          quickFix: {
            label: 'Add Read Replica',
            actionType: 'add_replica',
            targetId: node.id,
          },
        });
      }
    }
  });

  // RULE 3: Direct Database Public Exposure
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (
      (sourceNode?.data?.type === 'gateway' || sourceNode?.data?.tier === 'edge') &&
      targetNode?.data?.type === 'database'
    ) {
      violations.push({
        id: `violation-direct-db-${edge.id}`,
        ruleId: 'RULE_DIRECT_DATABASE_EXPOSURE',
        severity: 'critical',
        category: 'Public_Exposure',
        title: `Public Ingress Directly Wired to Database`,
        description: `Edge Gateway "${sourceNode.data.label}" directly routes to database "${targetNode.data.label}" without an intermediary application compute tier or authentication gateway.`,
        complianceImpact: 'Severe architectural security anti-pattern; exposes data persistence to direct DDoS and SQL injection.',
        nodeIds: [edge.source, edge.target],
        edgeIds: [edge.id],
      });
    }
  });

  // RULE 4: Uncached High-Throughput Read Bottleneck
  nodes.forEach((node) => {
    if (node.data.type === 'compute' && node.data.tier === 'application') {
      const outgoing = outgoingEdgesMap.get(node.id) || [];
      const targetsDatabase = outgoing.some((e) => {
        const targetNode = nodes.find((n) => n.id === e.target);
        return targetNode?.data?.type === 'database';
      });

      const targetsCache = outgoing.some((e) => {
        const targetNode = nodes.find((n) => n.id === e.target);
        return targetNode?.data?.type === 'cache';
      });

      if (targetsDatabase && !targetsCache) {
        violations.push({
          id: `violation-uncached-${node.id}`,
          ruleId: 'RULE_UNCACHED_DATABASE_BOTTLENECK',
          severity: 'warning',
          category: 'Performance_Bottleneck',
          title: `Uncached Database Queries on ${node.data.label}`,
          description: `Compute service queries database persistence directly without an in-memory caching tier (Redis/Memcached). Frequent reads will lead to connection saturation and latency spikes.`,
          complianceImpact: 'Performance resilience & horizontal scalability bottleneck.',
          nodeIds: [node.id],
          edgeIds: [],
          quickFix: {
            label: 'Insert Redis Cache',
            actionType: 'add_cache',
            targetId: node.id,
          },
        });
      }
    }
  });

  // RULE 5: Orphaned Component (No connections)
  nodes.forEach((node) => {
    const incoming = incomingEdgesMap.get(node.id) || [];
    const outgoing = outgoingEdgesMap.get(node.id) || [];
    if (incoming.length === 0 && outgoing.length === 0) {
      violations.push({
        id: `violation-orphaned-${node.id}`,
        ruleId: 'RULE_ORPHANED_SERVICE',
        severity: 'info',
        category: 'Topology_Hygiene',
        title: `Orphaned Service: ${node.data.label}`,
        description: `Service has 0 incoming and 0 outgoing connections. It is inactive in the runtime traffic path.`,
        nodeIds: [node.id],
        edgeIds: [],
        quickFix: {
          label: 'Prune Component',
          actionType: 'prune_node',
          targetId: node.id,
        },
      });
    }
  });

  // RULE 6: Explicit Node Threats (flagged by WebMCP agent or security scans)
  nodes.forEach((node) => {
    if (node.data.threatLevel && node.data.threatLevel !== 'none') {
      const isAlreadyCovered = violations.some(
        (v) =>
          v.nodeIds.includes(node.id) &&
          (v.severity === node.data.threatLevel ||
            (node.data.category && v.category === node.data.category))
      );
      if (!isAlreadyCovered) {
        violations.push({
          id: `violation-threat-${node.id}`,
          ruleId: 'RULE_EXPLICIT_NODE_THREAT',
          severity:
            node.data.threatLevel === 'critical'
              ? 'critical'
              : node.data.threatLevel === 'medium'
              ? 'warning'
              : 'info',
          category: (node.data.category as ViolationCategory) || 'Security_Vulnerability',
          title: `${node.data.category || 'Vulnerability'}: ${node.data.label}`,
          description: node.data.threatDescription || `Security threat flagged on ${node.data.label}.`,
          complianceImpact: 'Violates infrastructure security baseline policy.',
          nodeIds: [node.id],
          edgeIds: [],
          quickFix: {
            label: 'Resolve Threat',
            actionType: 'resolve_node_threat',
            targetId: node.id,
          },
        });
      }
    }
  });

  // Calculate Health Score (100 Max, -25 per Critical, -10 per Warning, -5 per Info)
  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;
  const infoCount = violations.filter((v) => v.severity === 'info').length;

  const penalty = criticalCount * 25 + warningCount * 10 + infoCount * 5;
  const healthScore = Math.max(0, 100 - penalty);

  return {
    timestamp: new Date().toISOString(),
    healthScore,
    totalViolations: violations.length,
    criticalCount,
    warningCount,
    infoCount,
    violations,
  };
}
