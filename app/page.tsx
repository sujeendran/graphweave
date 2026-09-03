'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore, ServiceNodeData } from '@/store/useCanvasStore';
import { CustomServiceNode } from '@/components/CustomServiceNode';
import { ControlToolbar } from '@/components/ControlToolbar';
import { TelemetryOverlay } from '@/components/TelemetryOverlay';
import { ThreatModal } from '@/components/ThreatModal';
import { TopologySnapshotModal } from '@/components/TopologySnapshotModal';
import { useWebMCP } from '@/hooks/useWebMCP';
import {
  Sparkles,
  MousePointerClick,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

export default function GraphWeavePage() {
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isTopologyOpen, setIsTopologyOpen] = useState(false);

  // Register WebMCP tools and resource
  useWebMCP();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    autoLayout,
    clearCanvas,
    addServiceNode,
    connectServices,
    flagThreat,
    resolveThreat,
    logActivity,
  } = useCanvasStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      serviceNode: CustomServiceNode,
    }),
    []
  );

  // Complete 2-Stage Agentic Scenario (Generative Pipeline -> STRIDE Analysis -> Automated Healing)
  const runSimulatedScenario = useCallback(async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      logActivity('Simulation started: Autonomous Agent Architecture & Threat Healing', 'agent');
      clearCanvas();
      await new Promise((r) => setTimeout(r, 400));

      // Step 1: Agent spawns edge gateway
      addServiceNode('cf-gateway', 'Cloudflare WAF / Ingress', 'gateway', 'edge');
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Agent spawns compute microservices
      addServiceNode('auth-svc', 'OAuth 2.0 Auth Server', 'compute', 'application');
      addServiceNode('payment-svc', 'PCI Payment Engine (Go)', 'compute', 'application');
      connectServices('cf-gateway', 'auth-svc', 'HTTPS/2 (mTLS)', true);
      connectServices('cf-gateway', 'payment-svc', 'HTTPS/2 (mTLS)', true);
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Agent spawns database with unencrypted channel
      addServiceNode('pg-primary', 'PostgreSQL 16 Primary', 'database', 'persistence');
      connectServices('payment-svc', 'pg-primary', 'TCP Plaintext (Unsecured)', false);
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 700));

      // Step 4: Agent spawns cache
      addServiceNode('redis-cache', 'Redis Session Cluster', 'cache', 'persistence');
      connectServices('auth-svc', 'redis-cache', 'RESP3 (mTLS)', true);
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 800));

      // Step 5: WebMCP Agent executes STRIDE threat modeling on topology
      logActivity(
        'Agent invoked STRIDE Threat Modeling algorithm over canvas://topology',
        'agent',
        'Evaluated 5 nodes and 4 edges for CVEs, SPOF, and unencrypted boundaries.'
      );
      await new Promise((r) => setTimeout(r, 500));

      flagThreat(
        'pg-primary',
        'critical',
        'Single Point of Failure: No standby replica or automated failover pool configured.',
        'SPOF'
      );
      await new Promise((r) => setTimeout(r, 1200));

      // Step 6: Autonomous Agent Healing
      logActivity(
        'Agent self-healing: Provisioning hot standby replica & upgrading channel to mTLS',
        'agent'
      );
      addServiceNode('pg-standby', 'PostgreSQL Read Replica (Hot Standby)', 'database', 'persistence');
      connectServices('pg-primary', 'pg-standby', 'WAL Streaming (TLS)', true);
      connectServices('payment-svc', 'pg-primary', 'gRPC (mTLS Secured)', true);
      resolveThreat('pg-primary');
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 400));

      logActivity(
        'Autonomous remediation complete: Architecture is fully redundant and encrypted.',
        'agent'
      );
    } finally {
      setIsSimulating(false);
    }
  }, [
    isSimulating,
    clearCanvas,
    addServiceNode,
    connectServices,
    autoLayout,
    flagThreat,
    resolveThreat,
    logActivity,
  ]);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Initializing GraphWeave Canvas Engine...</p>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 select-none">
      {/* Top Application Bar */}
      <ControlToolbar
        onRunSimulation={runSimulatedScenario}
        isSimulating={isSimulating}
        onOpenTopology={() => setIsTopologyOpen(true)}
      />

      {/* Main Interactive Stage */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.25,
            maxZoom: 0.88,
          }}
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.88 }}
        >
          <Background color="#27272a" gap={24} size={1.2} />
          <Controls
            showInteractive={false}
            className="!bg-zinc-900 !border-zinc-800 !shadow-xl fill-zinc-300"
          />
          <MiniMap
            nodeStrokeColor="#71717a"
            nodeColor="#27272a"
            maskColor="rgba(9, 9, 11, 0.8)"
            className="!bg-zinc-900 !border-zinc-800 rounded-xl overflow-hidden shadow-xl"
          />
        </ReactFlow>

        {/* Floating Quick Guide / Legend */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 backdrop-blur-md shadow-xl max-w-xs hidden sm:flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Architecture & Threat Map</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
            Drag nodes to reshape topology. Click any component to inspect security controls or simulate failure scenarios.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-sans text-zinc-400 pt-2 border-t border-zinc-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Plaintext Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Warning
            </span>
          </div>
        </div>

        {/* Telemetry Log Stream */}
        <TelemetryOverlay />

        {/* Threat Inspection Modal */}
        <ThreatModal />

        {/* WebMCP Topology Snapshot Modal */}
        <TopologySnapshotModal
          isOpen={isTopologyOpen}
          onClose={() => setIsTopologyOpen(false)}
        />
      </div>
    </main>
  );
}
