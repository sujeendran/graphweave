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
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Initializing GraphWeave Canvas Engine...</p>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 select-none">
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
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        >
          <Background color="#1e293b" gap={24} size={1.5} />
          <Controls
            showInteractive={false}
            className="!bg-slate-900 !border-slate-800 !shadow-2xl fill-slate-300"
          />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#1e293b"
            maskColor="rgba(2, 6, 23, 0.75)"
            className="!bg-slate-900 !border-slate-800 rounded-xl overflow-hidden shadow-2xl"
          />
        </ReactFlow>

        {/* Floating Quick Guide / Legend */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md shadow-2xl max-w-xs hidden sm:flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive WebMCP Canvas</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Drag nodes to reshape topology. Click any node to inspect STRIDE threats or trigger one-click remediation.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Encrypted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Plaintext Risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning
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
