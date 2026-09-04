import { create } from 'zustand';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  addEdge,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import {
  evaluateArchitecture,
  ArchitectureAuditReport,
  ArchitectureViolation,
} from '@/lib/architectureRulesEngine';

export type ServiceType = 'gateway' | 'compute' | 'database' | 'queue' | 'cache' | 'storage';
export type ThreatLevel = 'none' | 'low' | 'medium' | 'critical';

export interface ServiceNodeData extends Record<string, unknown> {
  label: string;
  type: ServiceType;
  threatLevel: ThreatLevel;
  threatDescription?: string;
  category?: string;
  tier?: 'edge' | 'application' | 'persistence';
  metadata?: Record<string, string>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  source: 'agent' | 'human';
  details?: string;
}

interface CanvasState {
  nodes: Node<ServiceNodeData>[];
  edges: Edge[];
  activities: ActivityLog[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedViolationId: string | null;
  onNodesChange: OnNodesChange<Node<ServiceNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedViolationId: (id: string | null) => void;
  applyQuickFix: (violationId: string) => void;
  getAuditReport: () => ArchitectureAuditReport;
  updateEdge: (
    id: string,
    updates: {
      protocol: string;
      isEncrypted: boolean;
      port?: string;
      customLabel?: string;
    }
  ) => void;
  removeEdge: (id: string, source?: 'agent' | 'human') => void;
  disconnectServices: (source: string, target: string, sourceType?: 'agent' | 'human') => boolean;
  addServiceNode: (
    id: string,
    label: string,
    type: ServiceType,
    tier?: 'edge' | 'application' | 'persistence',
    source?: 'agent' | 'human',
    position?: { x: number; y: number }
  ) => void;
  connectServices: (
    source: string,
    target: string,
    protocol?: string,
    isEncrypted?: boolean,
    sourceType?: 'agent' | 'human'
  ) => void;
  flagThreat: (
    nodeId: string,
    level: ThreatLevel,
    description: string,
    category?: string
  ) => void;
  resolveThreat: (nodeId: string) => void;
  removeNode: (nodeId: string, source?: 'agent' | 'human') => void;
  clearCanvas: (source?: 'agent' | 'human') => void;
  simulateChaosOutage: (
    nodeId: string,
    scenario?: 'crash' | 'high_latency' | 'ddos'
  ) => {
    targetNode: string;
    nodeLabel: string;
    scenario: string;
    status: string;
    impact: {
      downstreamNodes: string[];
      upstreamNodes: string[];
      affectedEdgeCount: number;
    };
    mitigationRecommendation: string;
  };
  autoLayout: (direction?: 'LR' | 'TB') => void;
  getTopologySnapshot: () => {
    nodes: Array<{
      id: string;
      type: ServiceType;
      label: string;
      threatLevel: ThreatLevel;
      threat?: string;
      tier?: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      protocol?: string;
      isEncrypted: boolean;
    }>;
    metrics: {
      nodeCount: number;
      edgeCount: number;
      unsecuredEdges: number;
      criticalRisks: number;
      warningRisks: number;
      securityScore: number;
    };
  };
  logActivity: (action: string, source: 'agent' | 'human', details?: string) => void;
  loadPreset: (presetName: 'ecommerce' | 'rag' | 'microservices') => void;
  exportTopology: () => Record<string, unknown>;
  importTopology: (jsonData: unknown) => { success: boolean; nodeCount?: number; edgeCount?: number; error?: string };
}

const initialNodes: Node<ServiceNodeData>[] = [
  {
    id: 'ingress-gw',
    position: { x: 50, y: 180 },
    data: {
      label: 'Cloudflare Edge (Ingress)',
      type: 'gateway',
      threatLevel: 'none',
      tier: 'edge',
    },
    type: 'serviceNode',
  },
  {
    id: 'auth-svc',
    position: { x: 350, y: 100 },
    data: {
      label: 'OAuth 2.0 Auth Service',
      type: 'compute',
      threatLevel: 'none',
      tier: 'application',
    },
    type: 'serviceNode',
  },
  {
    id: 'core-api',
    position: { x: 350, y: 260 },
    data: {
      label: 'Core REST API Gateway',
      type: 'compute',
      threatLevel: 'none',
      tier: 'application',
    },
    type: 'serviceNode',
  },
  {
    id: 'primary-db',
    position: { x: 650, y: 260 },
    data: {
      label: 'Primary PostgreSQL 16',
      type: 'database',
      threatLevel: 'none',
      tier: 'persistence',
    },
    type: 'serviceNode',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-ingress-auth',
    source: 'ingress-gw',
    target: 'auth-svc',
    label: 'HTTPS/2 (mTLS)',
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
    data: { protocol: 'HTTPS/2 (mTLS)', isEncrypted: true },
  },
  {
    id: 'e-ingress-core',
    source: 'ingress-gw',
    target: 'core-api',
    label: 'gRPC (TLS)',
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
    data: { protocol: 'gRPC (TLS)', isEncrypted: true },
  },
  {
    id: 'e-core-db',
    source: 'core-api',
    target: 'primary-db',
    label: 'TCP Plaintext',
    animated: true,
    style: {
      stroke: '#f43f5e',
      strokeWidth: 2,
      strokeDasharray: '5,5',
    },
    data: {
      protocol: 'TCP Plaintext',
      isEncrypted: false,
    },
  },
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  activities: [
    {
      id: 'init-1',
      timestamp: '00:00:01',
      action: 'Initialized baseline architecture topology',
      source: 'agent',
    },
    {
      id: 'init-2',
      timestamp: '00:00:02',
      action: 'STRIDE Threat Detection: Flagged primary-db (CRITICAL SPOF)',
      source: 'agent',
      details: 'Unencrypted channel detected on edge core-api -> primary-db',
    },
  ],
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedViolationId: null,

  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setSelectedViolationId: (id) => set({ selectedViolationId: id }),

  updateEdge: (id, { protocol, isEncrypted, port, customLabel }) => {
    const edge = get().edges.find((e) => e.id === id);
    if (!edge) return;

    const labelText = customLabel || (port ? `${protocol} (:${port})` : protocol);
    const updatedEdges = get().edges.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          label: labelText,
          style: {
            stroke: isEncrypted ? '#38bdf8' : '#f43f5e',
            strokeWidth: 2,
            strokeDasharray: isEncrypted ? undefined : '5,5',
          },
          data: {
            ...((e.data as Record<string, unknown>) || {}),
            protocol,
            port,
            isEncrypted,
          },
        };
      }
      return e;
    });

    set({ edges: updatedEdges, selectedEdgeId: null });

    if (isEncrypted) {
      const srcNode = get().nodes.find((n) => n.id === edge.source);
      const tgtNode = get().nodes.find((n) => n.id === edge.target);
      if (srcNode && (srcNode.data.category === 'Unencrypted' || srcNode.data.threatDescription?.toLowerCase().includes('plaintext'))) {
        get().resolveThreat(srcNode.id);
      }
      if (tgtNode && (tgtNode.data.category === 'Unencrypted' || tgtNode.data.threatDescription?.toLowerCase().includes('plaintext'))) {
        get().resolveThreat(tgtNode.id);
      }
    }

    const statusText = isEncrypted ? 'Encrypted TLS' : 'Unencrypted Plaintext (Security Risk)';
    get().logActivity(
      `Configured connection: ${edge.source} → ${edge.target} [${protocol}]`,
      'human',
      `Transport security set to ${statusText}${port ? ` on port ${port}` : ''}`
    );
  },

  removeEdge: (id, source = 'human') => {
    const edge = get().edges.find((e) => e.id === id);
    set({
      edges: get().edges.filter((e) => e.id !== id),
      selectedEdgeId: null,
    });
    if (edge) {
      get().logActivity(`Removed connection: ${edge.source} → ${edge.target}`, source);
    }
  },

  disconnectServices: (source, target, sourceType = 'agent') => {
    const edge = get().edges.find(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
    );
    if (!edge) return false;
    get().removeEdge(edge.id, sourceType);
    return true;
  },

  logActivity: (action, source, details) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      source,
      details,
    };
    set({ activities: [newLog, ...get().activities.slice(0, 49)] });
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<ServiceNodeData>[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const edgeId = `e-${connection.source}-${connection.target}-${Date.now().toString(36)}`;
    const newEdge: Edge = {
      ...connection,
      id: edgeId,
      animated: true,
      label: 'HTTPS / REST (TLS)',
      style: { stroke: '#38bdf8', strokeWidth: 2 },
      data: {
        protocol: 'HTTPS / REST',
        isEncrypted: true,
        port: '443',
      },
    };
    set({
      edges: addEdge(newEdge, get().edges),
      selectedEdgeId: edgeId,
    });
    get().logActivity(
      `Connected: ${connection.source} → ${connection.target} (HTTPS / REST)`,
      'human',
      'Configuring connection properties...'
    );
  },

  addServiceNode: (id, label, type, tier = 'application', source = 'human', position) => {
    const existing = get().nodes.find((n) => n.id === id);
    if (existing) return;

    // Calculate smart non-overlapping position if none provided
    const currentNodes = get().nodes;
    let nodePos = position;
    if (!nodePos) {
      if (currentNodes.length === 0) {
        nodePos = { x: 100, y: 180 };
      } else {
        const maxX = Math.max(...currentNodes.map((n) => n.position.x));
        const rightmostNode = currentNodes.find((n) => n.position.x === maxX);
        nodePos = {
          x: maxX + 290,
          y: rightmostNode ? rightmostNode.position.y : 180,
        };
      }
    }

    const newNode: Node<ServiceNodeData> = {
      id,
      position: nodePos,
      data: {
        label,
        type,
        threatLevel: 'none',
        tier,
      },
      type: 'serviceNode',
    };

    set({ nodes: [...currentNodes, newNode] });
    get().logActivity(
      `Added node: ${label} [${type}]`,
      source,
      source === 'human' ? 'Created manually via Node Spawner' : 'Provisioned by WebMCP Agent'
    );
    // Note: Do NOT call autoLayout() here to preserve user's manual layout
  },

  connectServices: (source, target, protocol = 'HTTPS', isEncrypted = true, sourceType = 'agent') => {
    const edgeId = `e-${source}-${target}`;
    const exists = get().edges.some((e) => e.id === edgeId || (e.source === source && e.target === target));
    if (exists) return;

    const newEdge: Edge = {
      id: edgeId,
      source,
      target,
      label: protocol,
      animated: true,
      style: {
        stroke: isEncrypted ? '#38bdf8' : '#f43f5e',
        strokeWidth: 2,
        strokeDasharray: isEncrypted ? undefined : '5,5',
      },
      data: {
        protocol,
        isEncrypted,
      },
    };

    set({ edges: [...get().edges, newEdge] });
    get().logActivity(
      `Linked: ${source} → ${target} (${protocol}) [${isEncrypted ? 'ENCRYPTED' : 'UNENCRYPTED'}]`,
      sourceType
    );
  },

  flagThreat: (nodeId, threatLevel, description, category = 'Vulnerability') => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                threatLevel,
                threatDescription: description,
                category,
              },
            }
          : node
      ),
    });
    get().logActivity(`Flagged Threat (${threatLevel.toUpperCase()}): ${nodeId} - ${category}`, 'agent', description);
  },

  resolveThreat: (nodeId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                threatLevel: 'none',
                threatDescription: undefined,
                category: undefined,
              },
            }
          : node
      ),
    });
    get().logActivity(`Resolved threat on node: ${nodeId}`, 'human', 'Restored service health status');
  },

  getAuditReport: () => {
    return evaluateArchitecture(get().nodes, get().edges);
  },

  applyQuickFix: (violationId: string) => {
    const { nodes, edges } = get();
    const report = evaluateArchitecture(nodes, edges);
    const violation = report.violations.find((v) => v.id === violationId);
    if (!violation || !violation.quickFix) return;

    const { actionType, targetId } = violation.quickFix;

    if (actionType === 'upgrade_tls') {
      get().updateEdge(targetId, {
        protocol: 'HTTPS / REST (TLS)',
        isEncrypted: true,
        customLabel: 'HTTPS / REST (TLS)',
      });
      get().logActivity('Quick-Fix Applied: Upgraded connection to TLS', 'human', `Secured edge: ${targetId}`);
    } else if (actionType === 'add_replica') {
      const primaryNode = nodes.find((n) => n.id === targetId);
      if (!primaryNode) return;

      const replicaId = `${targetId}-replica`;
      const replicaLabel = `${primaryNode.data.label} (Standby Replica)`;
      const newPos = {
        x: primaryNode.position.x + 290,
        y: primaryNode.position.y + 30,
      };

      get().addServiceNode(replicaId, replicaLabel, 'database', 'persistence', 'human', newPos);
      get().connectServices(targetId, replicaId, 'PostgreSQL Streaming Replication', true, 'human');
      get().resolveThreat(targetId);
      get().logActivity(
        'Quick-Fix Applied: Provisioned Standby Replica',
        'human',
        `Configured active failover replication for ${primaryNode.data.label}`
      );
    } else if (actionType === 'add_cache') {
      const computeNode = nodes.find((n) => n.id === targetId);
      if (!computeNode) return;

      const cacheId = `${targetId}-cache`;
      const cacheLabel = 'Redis Cluster Cache';
      const newPos = {
        x: computeNode.position.x + 290,
        y: computeNode.position.y - 110,
      };

      get().addServiceNode(cacheId, cacheLabel, 'cache', 'persistence', 'human', newPos);
      get().connectServices(targetId, cacheId, 'Redis RESP3 (TLS)', true, 'human');
      get().resolveThreat(targetId);
      get().logActivity(
        'Quick-Fix Applied: Inserted Redis Cache',
        'human',
        `Relieved database read bottleneck on ${computeNode.data.label}`
      );
    } else if (actionType === 'resolve_node_threat') {
      get().resolveThreat(targetId);
      get().logActivity('Quick-Fix Applied: Remediated Node Threat', 'human', `Resolved security threat on ${targetId}`);
    } else if (actionType === 'prune_node') {
      get().removeNode(targetId);
      get().logActivity('Quick-Fix Applied: Pruned Component', 'human', `Removed orphaned node: ${targetId}`);
    }
  },

  removeNode: (nodeId, source = 'human') => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    get().logActivity(`Removed node: ${nodeId}`, source);
  },

  clearCanvas: (source = 'human') => {
    const logSource = source === 'agent' ? 'agent' : 'human';
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      selectedViolationId: null,
    });
    get().logActivity('Canvas reset: Cleared all nodes and edges', logSource);
  },

  simulateChaosOutage: (nodeId, scenario = 'crash') => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found for chaos simulation`);
    }

    const outgoingEdges = get().edges.filter((e) => e.source === nodeId);
    const incomingEdges = get().edges.filter((e) => e.target === nodeId);
    const downstreamNodeIds = outgoingEdges.map((e) => e.target);
    const upstreamNodeIds = incomingEdges.map((e) => e.source);

    // Flag node with critical outage threat
    get().flagThreat(
      nodeId,
      'critical',
      `[CHAOS OUTAGE - ${scenario.toUpperCase()}] Service is offline. ${downstreamNodeIds.length} downstream dependencies impacted.`,
      'Chaos_Outage'
    );

    get().logActivity(
      `Chaos Outage Simulated: ${node.data.label} (${scenario.toUpperCase()})`,
      'agent',
      `Impact: ${downstreamNodeIds.length} downstream nodes potentially isolated`
    );

    return {
      targetNode: nodeId,
      nodeLabel: node.data.label,
      scenario,
      status: 'offline',
      impact: {
        downstreamNodes: downstreamNodeIds,
        upstreamNodes: upstreamNodeIds,
        affectedEdgeCount: outgoingEdges.length + incomingEdges.length,
      },
      mitigationRecommendation:
        'Provision a standby replica with automated failover, or configure circuit breaking / fallback queue.',
    };
  },

  autoLayout: (direction = 'LR') => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 140 });
    g.setDefaultEdgeLabel(() => ({}));

    const { nodes, edges } = get();
    nodes.forEach((node) => g.setNode(node.id, { width: 260, height: 95 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const nodePosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodePosition ? nodePosition.x - 130 : node.position.x,
          y: nodePosition ? nodePosition.y - 47 : node.position.y,
        },
      };
    });

    set({ nodes: layoutedNodes });
  },

  getTopologySnapshot: () => {
    const { nodes, edges } = get();
    const report = evaluateArchitecture(nodes, edges);
    const unsecuredEdges = edges.filter(
      (e) => (e.data as { isEncrypted?: boolean } | undefined)?.isEncrypted === false || e.style?.stroke === '#f43f5e'
    ).length;

    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        label: n.data.label,
        threatLevel: n.data.threatLevel,
        threat: n.data.threatDescription,
        tier: n.data.tier,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        protocol: typeof e.label === 'string' ? e.label : undefined,
        isEncrypted: (e.data as { isEncrypted?: boolean } | undefined)?.isEncrypted !== false && e.style?.stroke !== '#f43f5e',
      })),
      metrics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        unsecuredEdges,
        criticalRisks: report.criticalCount,
        warningRisks: report.warningCount,
        securityScore: report.healthScore,
      },
    };
  },

  loadPreset: (presetName) => {
    get().clearCanvas();

    if (presetName === 'ecommerce') {
      const pNodes: Node<ServiceNodeData>[] = [
        {
          id: 'cf-edge',
          position: { x: 50, y: 160 },
          data: { label: 'Cloudflare WAF & Edge', type: 'gateway', threatLevel: 'none', tier: 'edge' },
          type: 'serviceNode',
        },
        {
          id: 'auth-jwt',
          position: { x: 320, y: 80 },
          data: { label: 'Identity & JWT Service', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'checkout-api',
          position: { x: 320, y: 240 },
          data: { label: 'Checkout & Cart Engine', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'payment-vault',
          position: { x: 600, y: 240 },
          data: {
            label: 'PCI-DSS Token Vault',
            type: 'compute',
            threatLevel: 'none',
            tier: 'application',
          },
          type: 'serviceNode',
        },
        {
          id: 'pg-orders',
          position: { x: 880, y: 240 },
          data: {
            label: 'Orders PostgreSQL 16',
            type: 'database',
            threatLevel: 'none',
            tier: 'persistence',
          },
          type: 'serviceNode',
        },
      ];

      const pEdges: Edge[] = [
        { id: 'e-cf-auth', source: 'cf-edge', target: 'auth-jwt', label: 'HTTPS/2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'HTTPS/2', isEncrypted: true } },
        { id: 'e-cf-checkout', source: 'cf-edge', target: 'checkout-api', label: 'HTTPS/2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'HTTPS/2', isEncrypted: true } },
        { id: 'e-checkout-vault', source: 'checkout-api', target: 'payment-vault', label: 'gRPC (mTLS)', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'gRPC (mTLS)', isEncrypted: true } },
        { id: 'e-vault-db', source: 'payment-vault', target: 'pg-orders', label: 'TCP Plaintext', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '5,5' }, data: { protocol: 'TCP Plaintext', isEncrypted: false } },
      ];

      set({ nodes: pNodes, edges: pEdges });
      get().autoLayout('LR');
      get().logActivity('Loaded preset: PCI-DSS E-Commerce Pipeline', 'human');
    } else if (presetName === 'rag') {
      const pNodes: Node<ServiceNodeData>[] = [
        {
          id: 'ai-gateway',
          position: { x: 50, y: 160 },
          data: { label: 'AI Gateway (Rate Limiter)', type: 'gateway', threatLevel: 'none', tier: 'edge' },
          type: 'serviceNode',
        },
        {
          id: 'orchestrator',
          position: { x: 320, y: 160 },
          data: { label: 'LangGraph Orchestrator', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'embed-svc',
          position: { x: 600, y: 60 },
          data: { label: 'Embedding Service (vLLM)', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'qdrant-cluster',
          position: { x: 600, y: 260 },
          data: {
            label: 'Qdrant Vector DB',
            type: 'database',
            threatLevel: 'none',
            tier: 'persistence',
          },
          type: 'serviceNode',
        },
        {
          id: 's3-docs',
          position: { x: 880, y: 160 },
          data: { label: 'Document Lakehouse (S3)', type: 'storage', threatLevel: 'none', tier: 'persistence' },
          type: 'serviceNode',
        },
      ];

      const pEdges: Edge[] = [
        { id: 'e-gw-orch', source: 'ai-gateway', target: 'orchestrator', label: 'WebSocket Stream', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'WebSocket Stream', isEncrypted: true } },
        { id: 'e-orch-embed', source: 'orchestrator', target: 'embed-svc', label: 'gRPC', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'gRPC', isEncrypted: true } },
        { id: 'e-orch-qdrant', source: 'orchestrator', target: 'qdrant-cluster', label: 'REST (Plaintext)', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '5,5' }, data: { protocol: 'REST (Plaintext)', isEncrypted: false } },
        { id: 'e-orch-s3', source: 'orchestrator', target: 's3-docs', label: 'HTTPS (IAM)', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, data: { protocol: 'HTTPS (IAM)', isEncrypted: true } },
      ];

      set({ nodes: pNodes, edges: pEdges });
      get().autoLayout('LR');
      get().logActivity('Loaded preset: GenAI RAG Architecture', 'human');
    } else if (presetName === 'microservices') {
      const pNodes: Node<ServiceNodeData>[] = [
        {
          id: 'kong-gw',
          position: { x: 50, y: 180 },
          data: { label: 'Kong API Gateway', type: 'gateway', threatLevel: 'none', tier: 'edge' },
          type: 'serviceNode',
        },
        {
          id: 'user-svc',
          position: { x: 320, y: 80 },
          data: { label: 'User Service (Node.js)', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'order-svc',
          position: { x: 320, y: 220 },
          data: { label: 'Order Processing (Go)', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
        {
          id: 'kafka-bus',
          position: { x: 600, y: 150 },
          data: { label: 'Kafka Event Broker', type: 'queue', threatLevel: 'none', tier: 'persistence' },
          type: 'serviceNode',
        },
        {
          id: 'redis-cache',
          position: { x: 600, y: 290 },
          data: { label: 'Redis Cluster Cache', type: 'cache', threatLevel: 'none', tier: 'persistence' },
          type: 'serviceNode',
        },
        {
          id: 'analytics-svc',
          position: { x: 880, y: 150 },
          data: { label: 'Analytics Worker', type: 'compute', threatLevel: 'none', tier: 'application' },
          type: 'serviceNode',
        },
      ];

      const pEdges: Edge[] = [
        { id: 'e-kg-user', source: 'kong-gw', target: 'user-svc', label: 'HTTP/2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e-kg-order', source: 'kong-gw', target: 'order-svc', label: 'HTTP/2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e-order-kafka', source: 'order-svc', target: 'kafka-bus', label: 'Kafka Protocol', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e-order-redis', source: 'order-svc', target: 'redis-cache', label: 'RESP3', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
        { id: 'e-kafka-analytics', source: 'kafka-bus', target: 'analytics-svc', label: 'Consumer Group', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
      ];

      set({ nodes: pNodes, edges: pEdges });
      get().autoLayout('LR');
      get().logActivity('Loaded preset: Event-Driven Microservices Mesh', 'human');
    }
  },

  exportTopology: () => {
    const { nodes, edges } = get();
    const snapshot = get().getTopologySnapshot();
    return {
      version: '1.0.0',
      appName: 'GraphWeave',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        label: n.data.label,
        threatLevel: n.data.threatLevel,
        threatDescription: n.data.threatDescription,
        category: n.data.category,
        tier: n.data.tier,
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === 'string' ? e.label : undefined,
        data: e.data,
        style: e.style,
        animated: e.animated,
      })),
      metrics: snapshot.metrics,
    };
  },

  importTopology: (jsonData: any) => {
    try {
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON format: root must be an object');
      }

      const rawNodes = Array.isArray(jsonData.nodes) ? jsonData.nodes : [];
      const rawEdges = Array.isArray(jsonData.edges) ? jsonData.edges : [];

      if (rawNodes.length === 0) {
        throw new Error('Invalid topology: no nodes found in JSON payload');
      }

      const importedNodes: Node<ServiceNodeData>[] = rawNodes.map((n: any, index: number) => ({
        id: String(n.id || `node-${index}`),
        position:
          n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
            ? n.position
            : { x: 100 + (index % 4) * 290, y: 140 + Math.floor(index / 4) * 160 },
        data: {
          label: String(n.label || n.id),
          type: (n.type || 'compute') as ServiceType,
          threatLevel: (n.threatLevel || 'none') as ThreatLevel,
          threatDescription: n.threatDescription || n.threat,
          category: n.category,
          tier: n.tier || 'application',
        },
        type: 'serviceNode',
      }));

      const importedEdges: Edge[] = rawEdges.map((e: any, index: number) => {
        const isEncrypted = e.data?.isEncrypted !== false && e.style?.stroke !== '#f43f5e';
        return {
          id: String(e.id || `e-${e.source}-${e.target}-${index}`),
          source: String(e.source),
          target: String(e.target),
          label: typeof e.label === 'string' ? e.label : isEncrypted ? 'HTTPS / REST (TLS)' : 'TCP Plaintext',
          animated: e.animated !== false,
          style: e.style || {
            stroke: isEncrypted ? '#38bdf8' : '#f43f5e',
            strokeWidth: 2,
            strokeDasharray: isEncrypted ? undefined : '5,5',
          },
          data: e.data || {
            protocol: typeof e.label === 'string' ? e.label : 'HTTPS',
            isEncrypted,
          },
        };
      });

      set({
        nodes: importedNodes,
        edges: importedEdges,
        selectedNodeId: null,
        selectedEdgeId: null,
      });

      get().logActivity(
        `Imported architecture: ${importedNodes.length} nodes, ${importedEdges.length} edges`,
        'human',
        'Loaded custom topology JSON manifest'
      );

      return { success: true, nodeCount: importedNodes.length, edgeCount: importedEdges.length };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to parse topology JSON' };
    }
  },
}));

// Expose on window for browser console testing & synthetic WebMCP runner
if (typeof window !== 'undefined') {
  (window as unknown as { useCanvasStore: typeof useCanvasStore }).useCanvasStore = useCanvasStore;
}
