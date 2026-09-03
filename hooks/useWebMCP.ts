'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasStore, ServiceType, ThreatLevel } from '@/store/useCanvasStore';

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
  handler?: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface WebMCPStatus {
  isAvailable: boolean;
  isNative: boolean;
  registeredTools: string[];
  registeredResources: string[];
}

export function useWebMCP() {
  const [status, setStatus] = useState<WebMCPStatus>({
    isAvailable: false,
    isNative: false,
    registeredTools: [],
    registeredResources: [],
  });

  const {
    addServiceNode,
    connectServices,
    flagThreat,
    resolveThreat,
    autoLayout,
    getTopologySnapshot,
    getAuditReport,
    applyQuickFix,
    logActivity,
  } = useCanvasStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synthetic executor for simulating tool calls or testing via UI/console
  const invokeTool = useCallback(
    async (toolName: string, params: Record<string, unknown>) => {
      logActivity(`WebMCP [RPC Request]: ${toolName}`, 'agent', JSON.stringify(params));
      switch (toolName) {
        case 'run_architecture_audit': {
          const report = getAuditReport();
          return {
            content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
          };
        }
        case 'auto_remediate_violation': {
          const { violationId } = params as { violationId: string };
          applyQuickFix(violationId);
          return {
            content: [{ type: 'text', text: `Successfully remediated architecture violation: ${violationId}` }],
          };
        }
        case 'add_service_node': {
          const { id, label, serviceType, tier } = params as {
            id: string;
            label: string;
            serviceType: ServiceType;
            tier?: 'edge' | 'application' | 'persistence';
          };
          addServiceNode(id, label, serviceType, tier, 'agent');
          return {
            content: [{ type: 'text', text: `Successfully spawned node: ${label} (${id})` }],
          };
        }
        case 'connect_services': {
          const { sourceId, targetId, protocol, isEncrypted } = params as {
            sourceId: string;
            targetId: string;
            protocol?: string;
            isEncrypted?: boolean;
          };
          connectServices(sourceId, targetId, protocol || 'HTTPS', isEncrypted ?? true, 'agent');
          return {
            content: [{ type: 'text', text: `Connected ${sourceId} → ${targetId} via ${protocol || 'HTTPS'}` }],
          };
        }
        case 'flag_threat': {
          const { nodeId, riskLevel, description, category } = params as {
            nodeId: string;
            riskLevel: ThreatLevel;
            description: string;
            category?: string;
          };
          flagThreat(nodeId, riskLevel, description, category);
          return {
            content: [{ type: 'text', text: `Flagged ${riskLevel} threat on ${nodeId}: ${description}` }],
          };
        }
        case 'resolve_threat': {
          const { nodeId, remediationNote } = params as {
            nodeId: string;
            remediationNote?: string;
          };
          resolveThreat(nodeId);
          logActivity(`Remediated threat on node: ${nodeId}`, 'agent', remediationNote || 'Applied security control');
          return {
            content: [{ type: 'text', text: `Resolved threat on node: ${nodeId}` }],
          };
        }
        case 'apply_auto_layout': {
          const { direction } = (params || {}) as { direction?: 'LR' | 'TB' };
          autoLayout(direction || 'LR');
          return {
            content: [{ type: 'text', text: `Applied Dagre auto-layout (${direction || 'LR'})` }],
          };
        }
        case 'get_topology_snapshot': {
          const snapshot = getTopologySnapshot();
          return {
            content: [{ type: 'text', text: JSON.stringify(snapshot, null, 2) }],
          };
        }
        default:
          throw new Error(`Unknown WebMCP tool: ${toolName}`);
      }
    },
    [
      addServiceNode,
      connectServices,
      flagThreat,
      resolveThreat,
      autoLayout,
      getTopologySnapshot,
      getAuditReport,
      applyQuickFix,
      logActivity,
    ]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Create abort controller to manage registration lifecycle according to WebMCP standard
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Detect native document.modelContext or install standard-compliant implementation
    const doc = document as unknown as {
      modelContext?: {
        registerTool: (spec: WebMCPToolDefinition, options?: { signal?: AbortSignal }) => void;
        registerResource?: (spec: unknown) => void;
        listTools?: () => WebMCPToolDefinition[];
        getTool?: (name: string) => WebMCPToolDefinition | undefined;
      };
    };

    const isNative = typeof doc.modelContext?.registerTool === 'function';

    // Polyfill document.modelContext if not natively provided by the browser
    if (!doc.modelContext) {
      const toolMap = new Map<string, WebMCPToolDefinition>();
      doc.modelContext = {
        registerTool: (spec: WebMCPToolDefinition, options?: { signal?: AbortSignal }) => {
          toolMap.set(spec.name, spec);
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              toolMap.delete(spec.name);
            });
          }
        },
        listTools: () => Array.from(toolMap.values()),
        getTool: (name: string) => toolMap.get(name),
      };
    }

    // Mirror to window.modelContext and navigator.modelContext for cross-environment compatibility
    (window as unknown as Record<string, unknown>).modelContext = doc.modelContext;
    (navigator as unknown as Record<string, unknown>).modelContext = doc.modelContext;

    // Tool specifications matching OpenAI WebMCP / Chrome W3C specification
    const toolDefinitions: WebMCPToolDefinition[] = [
      {
        name: 'run_architecture_audit',
        description: 'Execute the real-time Architecture Linter on the canvas to detect SPOFs, unencrypted channels, and compliance violations.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        execute: async () => {
          return invokeTool('run_architecture_audit', {});
        },
      },
      {
        name: 'auto_remediate_violation',
        description: 'Automatically execute an architectural quick-fix for a specific violation ID (e.g. provision read replica, upgrade to TLS).',
        inputSchema: {
          type: 'object',
          properties: {
            violationId: { type: 'string', description: 'Unique identifier of the violation to remediate' },
          },
          required: ['violationId'],
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('auto_remediate_violation', args);
        },
      },
      {
        name: 'add_service_node',
        description: 'Spawn an architectural service node onto the visual canvas with specific tier roles.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique alphanumeric identifier (e.g., auth-service)' },
            label: { type: 'string', description: 'Display name (e.g., OAuth 2.0 Auth Server)' },
            serviceType: {
              type: 'string',
              enum: ['gateway', 'compute', 'database', 'queue', 'cache', 'storage'],
              description: 'Service component classification',
            },
            tier: {
              type: 'string',
              enum: ['edge', 'application', 'persistence'],
              description: 'Architectural layer tier',
            },
          },
          required: ['id', 'label', 'serviceType'],
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('add_service_node', args);
        },
      },
      {
        name: 'connect_services',
        description: 'Establish a network connection edge between two services with protocol and encryption attributes.',
        inputSchema: {
          type: 'object',
          properties: {
            sourceId: { type: 'string', description: 'Source service node ID' },
            targetId: { type: 'string', description: 'Target destination service node ID' },
            protocol: { type: 'string', description: 'Protocol: gRPC, HTTPS, PostgreSQL Wire, Redis, WebSocket, Kafka, TCP' },
            isEncrypted: { type: 'boolean', description: 'Whether transport is encrypted with TLS/mTLS', default: true },
          },
          required: ['sourceId', 'targetId', 'protocol'],
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('connect_services', args);
        },
      },
      {
        name: 'flag_threat',
        description: 'Highlight a security vulnerability, bottleneck, or STRIDE threat on a specific node.',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of node to flag' },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'critical'], description: 'Risk severity' },
            category: {
              type: 'string',
              enum: ['SPOF', 'Unencrypted', 'DDoS_Risk', 'Data_Breach', 'Privilege_Escalation', 'Tampering'],
              description: 'STRIDE threat category',
            },
            description: { type: 'string', description: 'Explanation and remediation recommendation' },
          },
          required: ['nodeId', 'riskLevel', 'description'],
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('flag_threat', args);
        },
      },
      {
        name: 'resolve_threat',
        description: 'Remediate a previously flagged security threat on a node, restoring its healthy security posture.',
        inputSchema: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of the node to remediate' },
            remediationNote: { type: 'string', description: 'Optional explanation of fix applied' },
          },
          required: ['nodeId'],
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('resolve_threat', args);
        },
      },
      {
        name: 'apply_auto_layout',
        description: 'Trigger Dagre hierarchical graph layout optimization to organize nodes into clean tiers.',
        inputSchema: {
          type: 'object',
          properties: {
            direction: { type: 'string', enum: ['LR', 'TB'], default: 'LR', description: 'Layout direction (Left-to-Right or Top-to-Bottom)' },
          },
        },
        execute: async (args: Record<string, unknown>) => {
          return invokeTool('apply_auto_layout', args);
        },
      },
      {
        name: 'get_topology_snapshot',
        description: 'Read the complete current architecture topology JSON including nodes, edges, threats, and compliance posture score.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        execute: async () => {
          return invokeTool('get_topology_snapshot', {});
        },
      },
    ];

    // Register all tools onto document.modelContext
    const registeredToolNames: string[] = [];
    toolDefinitions.forEach((tool) => {
      const fullSpec: WebMCPToolDefinition = {
        ...tool,
        parameters: tool.inputSchema,
        handler: tool.execute,
      };

      try {
        doc.modelContext?.registerTool(fullSpec, { signal: controller.signal });
        registeredToolNames.push(tool.name);
      } catch (err) {
        console.warn(`WebMCP tool registration for "${tool.name}" encountered error:`, err);
      }
    });

    // Register canvas resources
    const registeredResourceNames: string[] = ['canvas://topology', 'canvas://audit-report'];
    if (doc.modelContext?.registerResource) {
      try {
        doc.modelContext.registerResource({
          uri: 'canvas://topology',
          name: 'Live Canvas Architecture Topology',
          mimeType: 'application/json',
          read: async () => {
            const snapshot = getTopologySnapshot();
            return {
              contents: [
                {
                  uri: 'canvas://topology',
                  mimeType: 'application/json',
                  text: JSON.stringify(snapshot, null, 2),
                },
              ],
            };
          },
        });

        doc.modelContext.registerResource({
          uri: 'canvas://audit-report',
          name: 'Real-Time Architecture Linter Audit Report',
          mimeType: 'application/json',
          read: async () => {
            const report = getAuditReport();
            return {
              contents: [
                {
                  uri: 'canvas://audit-report',
                  mimeType: 'application/json',
                  text: JSON.stringify(report, null, 2),
                },
              ],
            };
          },
        });
      } catch (err) {
        console.warn('WebMCP resource registration failed:', err);
      }
    }

    setStatus({
      isAvailable: true,
      isNative,
      registeredTools: registeredToolNames,
      registeredResources: registeredResourceNames,
    });

    logActivity(
      `WebMCP: ${registeredToolNames.length} tools registered on document.modelContext`,
      'agent',
      `Registered tools: ${registeredToolNames.join(', ')}`
    );

    // Expose runner on window for browser-level synthetic agent interactions & judges
    (window as unknown as {
      webMCP: {
        invokeTool: typeof invokeTool;
        getTopologySnapshot: typeof getTopologySnapshot;
        getAuditReport: typeof getAuditReport;
        listTools: () => WebMCPToolDefinition[];
      };
    }).webMCP = {
      invokeTool,
      getTopologySnapshot,
      getAuditReport,
      listTools: () => doc.modelContext?.listTools?.() || toolDefinitions,
    };

    return () => {
      controller.abort();
    };
  }, [invokeTool, getTopologySnapshot, getAuditReport, logActivity]);

  return {
    status,
    invokeTool,
  };
}
