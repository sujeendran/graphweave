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
  onNodesChange: OnNodesChange<Node<ServiceNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;
  addServiceNode: (
    id: string,
    label: string,
    type: ServiceType,
    tier?: 'edge' | 'application' | 'persistence'
  ) => void;
  connectServices: (
    source: string,
    target: string,
    protocol?: string,
    isEncrypted?: boolean
  ) => void;
  flagThreat: (
    nodeId: string,
    level: ThreatLevel,
    description: string,
    category?: string
  ) => void;
  resolveThreat: (nodeId: string) => void;
  removeNode: (nodeId: string) => void;
  clearCanvas: () => void;
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
      threatLevel: 'critical',
      category: 'SPOF',
      threatDescription: 'Single Point of Failure: No hot standby replica or automatic failover configured.',
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
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'e-ingress-core',
    source: 'ingress-gw',
    target: 'core-api',
    label: 'gRPC (TLS)',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
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
  },
];

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  activities: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: 'Initialized baseline architecture topology',
      source: 'agent',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: 'STRIDE Threat Detection: Flagged primary-db (CRITICAL SPOF)',
      source: 'agent',
      details: 'Unencrypted channel detected on edge core-api -> primary-db',
    },
  ],
  selectedNodeId: null,

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

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
    const newEdge: Edge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now().toString(36)}`,
      animated: true,
      label: 'TLS Channel',
      style: { stroke: '#6366f1', strokeWidth: 2 },
    };
    set({ edges: addEdge(newEdge, get().edges) });
    get().logActivity(`Connected ${connection.source} → ${connection.target}`, 'human');
  },

  addServiceNode: (id, label, type, tier = 'application') => {
    const existing = get().nodes.find((n) => n.id === id);
    if (existing) return;

    const newNode: Node<ServiceNodeData> = {
      id,
      position: { x: 150 + Math.random() * 250, y: 100 + Math.random() * 200 },
      data: {
        label,
        type,
        threatLevel: 'none',
        tier,
      },
      type: 'serviceNode',
    };

    set({ nodes: [...get().nodes, newNode] });
    get().logActivity(`Added node: ${label} [${type.toUpperCase()}]`, 'agent');
    get().autoLayout();
  },

  connectServices: (source, target, protocol = 'HTTPS', isEncrypted = true) => {
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
        stroke: isEncrypted ? '#6366f1' : '#f43f5e',
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
      'agent'
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
      // Also upgrade any connected plaintext edge to TLS
      edges: get().edges.map((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          if (edge.style?.stroke === '#f43f5e') {
            return {
              ...edge,
              label: 'mTLS (Secured)',
              style: { stroke: '#6366f1', strokeWidth: 2 },
            };
          }
        }
        return edge;
      }),
    });
    get().logActivity(`Remediated and verified threat on node: ${nodeId}`, 'human');
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    get().logActivity(`Removed node: ${nodeId}`, 'human');
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], activities: [], selectedNodeId: null });
  },

  autoLayout: (direction = 'LR') => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 120 });
    g.setDefaultEdgeLabel(() => ({}));

    const { nodes, edges } = get();
    nodes.forEach((node) => g.setNode(node.id, { width: 230, height: 95 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const nodePosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodePosition ? nodePosition.x - 115 : node.position.x,
          y: nodePosition ? nodePosition.y - 47 : node.position.y,
        },
      };
    });

    set({ nodes: layoutedNodes });
  },

  getTopologySnapshot: () => {
    const { nodes, edges } = get();
    const criticalRisks = nodes.filter((n) => n.data.threatLevel === 'critical').length;
    const warningRisks = nodes.filter((n) => n.data.threatLevel === 'medium' || n.data.threatLevel === 'low').length;
    const unsecuredEdges = edges.filter(
      (e) => (e.data as { isEncrypted?: boolean } | undefined)?.isEncrypted === false || e.style?.stroke === '#f43f5e'
    ).length;

    // Security Score: 100 max, -20 per critical, -10 per warning, -15 per unsecured edge
    const calculatedPenalty = criticalRisks * 25 + warningRisks * 10 + unsecuredEdges * 15;
    const securityScore = Math.max(0, 100 - calculatedPenalty);

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
        isEncrypted: e.style?.stroke !== '#f43f5e',
      })),
      metrics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        unsecuredEdges,
        criticalRisks,
        warningRisks,
        securityScore,
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
            threatLevel: 'critical',
            category: 'Unencrypted',
            threatDescription: 'Insecure Channel: Plaintext TCP to database leaks payment card tokens in transit.',
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
            threatLevel: 'medium',
            category: 'SPOF',
            threatDescription: 'No hot standby replica configured. Risk of service downtime during failover.',
            tier: 'persistence',
          },
          type: 'serviceNode',
        },
      ];

      const pEdges: Edge[] = [
        { id: 'e-cf-auth', source: 'cf-edge', target: 'auth-jwt', label: 'HTTPS/2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-cf-checkout', source: 'cf-edge', target: 'checkout-api', label: 'HTTPS/2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-checkout-vault', source: 'checkout-api', target: 'payment-vault', label: 'gRPC (mTLS)', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-vault-db', source: 'payment-vault', target: 'pg-orders', label: 'TCP Plaintext', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '5,5' } },
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
            threatLevel: 'medium',
            category: 'DDoS_Risk',
            threatDescription: 'Unauthenticated vector search endpoint exposed directly to internal network.',
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
        { id: 'e-gw-orch', source: 'ai-gateway', target: 'orchestrator', label: 'WebSocket Stream', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-orch-embed', source: 'orchestrator', target: 'embed-svc', label: 'gRPC', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-orch-qdrant', source: 'orchestrator', target: 'qdrant-cluster', label: 'REST (Unauthenticated)', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '5,5' } },
        { id: 'e-orch-s3', source: 'orchestrator', target: 's3-docs', label: 'HTTPS (IAM)', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
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
        { id: 'e-kg-user', source: 'kong-gw', target: 'user-svc', label: 'HTTP/2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-kg-order', source: 'kong-gw', target: 'order-svc', label: 'HTTP/2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-order-kafka', source: 'order-svc', target: 'kafka-bus', label: 'Kafka Protocol', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-order-redis', source: 'order-svc', target: 'redis-cache', label: 'RESP3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-kafka-analytics', source: 'kafka-bus', target: 'analytics-svc', label: 'Consumer Group', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      ];

      set({ nodes: pNodes, edges: pEdges });
      get().autoLayout('LR');
      get().logActivity('Loaded preset: Event-Driven Microservices Mesh', 'human');
    }
  },
}));

// Expose on window for browser console testing & synthetic WebMCP runner
if (typeof window !== 'undefined') {
  (window as unknown as { useCanvasStore: typeof useCanvasStore }).useCanvasStore = useCanvasStore;
}
