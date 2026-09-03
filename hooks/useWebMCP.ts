'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCanvasStore, ServiceType, ThreatLevel } from '@/store/useCanvasStore';

export interface WebMCPStatus {
  isAvailable: boolean;
  registeredTools: string[];
  registeredResources: string[];
}

export function useWebMCP() {
  const [status, setStatus] = useState<WebMCPStatus>({
    isAvailable: false,
    registeredTools: [],
    registeredResources: [],
  });

  const {
    addServiceNode,
    connectServices,
    flagThreat,
    autoLayout,
    getTopologySnapshot,
    logActivity,
  } = useCanvasStore();

  // Synthetic executor for simulating tool calls or testing via UI/console
  const invokeTool = useCallback(
    async (toolName: string, params: Record<string, unknown>) => {
      logActivity(`WebMCP [RPC Request]: ${toolName}`, 'agent', JSON.stringify(params));
      switch (toolName) {
        case 'add_service_node': {
          const { id, label, serviceType, tier } = params as {
            id: string;
            label: string;
            serviceType: ServiceType;
            tier?: 'edge' | 'application' | 'persistence';
          };
          addServiceNode(id, label, serviceType, tier);
          return { status: 'created', nodeId: id };
        }
        case 'connect_services': {
          const { sourceId, targetId, protocol, isEncrypted } = params as {
            sourceId: string;
            targetId: string;
            protocol?: string;
            isEncrypted?: boolean;
          };
          connectServices(sourceId, targetId, protocol || 'HTTPS', isEncrypted ?? true);
          return { status: 'connected', edge: `${sourceId}->${targetId}` };
        }
        case 'flag_threat': {
          const { nodeId, riskLevel, description, category } = params as {
            nodeId: string;
            riskLevel: ThreatLevel;
            description: string;
            category?: string;
          };
          flagThreat(nodeId, riskLevel, description, category);
          return { status: 'flagged', nodeId, riskLevel };
        }
        case 'apply_auto_layout': {
          const { direction } = (params || {}) as { direction?: 'LR' | 'TB' };
          autoLayout(direction || 'LR');
          return { status: 'layout_recalculated' };
        }
        default:
          throw new Error(`Unknown WebMCP tool: ${toolName}`);
      }
    },
    [addServiceNode, connectServices, flagThreat, autoLayout, logActivity]
  );

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as {
      modelContext?: {
        registerTool: (spec: unknown) => void;
        registerResource?: (spec: unknown) => void;
      };
    }) : undefined;

    const tools = ['add_service_node', 'connect_services', 'flag_threat', 'apply_auto_layout'];
    const resources = ['canvas://topology'];

    if (nav?.modelContext?.registerTool) {
      // 1. Tool: add_service_node
      nav.modelContext.registerTool({
        name: 'add_service_node',
        description: 'Spawn an architectural service node onto the visual canvas with specific tier roles.',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique alphanumeric identifier (e.g., auth-service)' },
            label: { type: 'string', description: 'Display name (e.g., OAuth 2.0 Auth Server)' },
            serviceType: {
              type: 'string',
              enum: ['gateway', 'compute', 'database', 'queue', 'cache', 'storage'],
            },
            tier: { type: 'string', enum: ['edge', 'application', 'persistence'] },
          },
          required: ['id', 'label', 'serviceType'],
        },
        handler: async (args: { id: string; label: string; serviceType: ServiceType; tier?: 'edge' | 'application' | 'persistence' }) => {
          return invokeTool('add_service_node', args);
        },
      });

      // 2. Tool: connect_services
      nav.modelContext.registerTool({
        name: 'connect_services',
        description: 'Establish a network connection edge between two services with protocol attributes.',
        parameters: {
          type: 'object',
          properties: {
            sourceId: { type: 'string', description: 'Source service node ID' },
            targetId: { type: 'string', description: 'Target service node ID' },
            protocol: { type: 'string', description: 'Protocol: gRPC, HTTPS, WebSocket, AMQP, Kafka' },
            isEncrypted: { type: 'boolean', default: true },
          },
          required: ['sourceId', 'targetId', 'protocol'],
        },
        handler: async (args: Record<string, unknown>) => {
          return invokeTool('connect_services', args);
        },
      });

      // 3. Tool: flag_threat
      nav.modelContext.registerTool({
        name: 'flag_threat',
        description: 'Highlight a security vulnerability, bottleneck, or SPOF on a specific node.',
        parameters: {
          type: 'object',
          properties: {
            nodeId: { type: 'string', description: 'ID of node to flag' },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'critical'] },
            category: { type: 'string', enum: ['SPOF', 'Unencrypted', 'DDoS_Risk', 'Data_Breach'] },
            description: { type: 'string', description: 'Explanation and remediation suggestion' },
          },
          required: ['nodeId', 'riskLevel', 'description'],
        },
        handler: async (args: Record<string, unknown>) => {
          return invokeTool('flag_threat', args);
        },
      });

      // 4. Tool: apply_auto_layout
      nav.modelContext.registerTool({
        name: 'apply_auto_layout',
        description: 'Trigger Dagre layout optimization to organize nodes into clean tiers.',
        parameters: {
          type: 'object',
          properties: {
            direction: { type: 'string', enum: ['LR', 'TB'], default: 'LR' },
          },
        },
        handler: async (args: { direction?: 'LR' | 'TB' }) => {
          return invokeTool('apply_auto_layout', args);
        },
      });

      // 5. Resource: canvas://topology
      if (nav.modelContext.registerResource) {
        nav.modelContext.registerResource({
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
      }

      setStatus({
        isAvailable: true,
        registeredTools: tools,
        registeredResources: resources,
      });

      logActivity('W3C WebMCP tools & resources registered to navigator.modelContext', 'agent');
    } else {
      setStatus({
        isAvailable: false,
        registeredTools: tools,
        registeredResources: resources,
      });
    }

    // Expose runner on window for browser-level synthetic agent interactions & judges
    if (typeof window !== 'undefined') {
      (window as unknown as {
        webMCP: {
          invokeTool: typeof invokeTool;
          getTopologySnapshot: typeof getTopologySnapshot;
        };
      }).webMCP = {
        invokeTool,
        getTopologySnapshot,
      };
    }
  }, [invokeTool, getTopologySnapshot, logActivity]);

  return {
    status,
    invokeTool,
  };
}
