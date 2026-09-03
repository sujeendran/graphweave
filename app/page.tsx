'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/store/useCanvasStore';
import { CustomServiceNode } from '@/components/CustomServiceNode';
import { ControlToolbar } from '@/components/ControlToolbar';
import { BottomDiagnosticsDock } from '@/components/BottomDiagnosticsDock';
import { EdgeConfigModal } from '@/components/EdgeConfigModal';
import { TopologySnapshotModal } from '@/components/TopologySnapshotModal';
import { AppGuideCard } from '@/components/AppGuideCard';
import { useWebMCP } from '@/hooks/useWebMCP';

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
    setSelectedNodeId,
    setSelectedEdgeId,
    autoLayout,
    clearCanvas,
    addServiceNode,
    connectServices,
    updateEdge,
    logActivity,
  } = useCanvasStore();

  useEffect(() => {
    setMounted(true);
    autoLayout('LR');
  }, [autoLayout]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      serviceNode: CustomServiceNode,
    }),
    []
  );

  // Realistic Agentic Co-Pilot Scenario (Synthesis -> Linter Audit -> 1-Click Auto-Remediation -> Compliance Verification)
  const runSimulatedScenario = useCallback(async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      clearCanvas();
      logActivity(
        'Phase 1/5: Synthesizing distributed topology from cloud architecture requirements...',
        'agent'
      );
      await new Promise((r) => setTimeout(r, 1200));

      // Step 1: Agent spawns edge gateway
      addServiceNode('cf-gateway', 'Cloudflare Edge WAF', 'gateway', 'edge', 'agent');
      logActivity(
        'Provisioned Edge Tier: Cloudflare WAF & DDoS Ingress Gateway',
        'agent'
      );
      await new Promise((r) => setTimeout(r, 1500));

      // Step 2: Agent spawns compute microservices
      addServiceNode('auth-svc', 'OAuth 2.0 Auth Server', 'compute', 'application', 'agent');
      addServiceNode('payment-svc', 'PCI Payment Engine (Go)', 'compute', 'application', 'agent');
      connectServices('cf-gateway', 'auth-svc', 'HTTPS / REST (TLS)', true, 'agent');
      connectServices('cf-gateway', 'payment-svc', 'HTTPS / REST (TLS)', true, 'agent');
      autoLayout('LR');
      logActivity(
        'Provisioned Application Tier: OAuth Auth & Payment Engine (mTLS secured)',
        'agent'
      );
      await new Promise((r) => setTimeout(r, 1800));

      // Step 3: Agent spawns database with unencrypted channel
      addServiceNode('pg-primary', 'PostgreSQL 16 Primary', 'database', 'persistence', 'agent');
      connectServices('payment-svc', 'pg-primary', 'TCP Plaintext (Unsecured)', false, 'agent');
      autoLayout('LR');
      logActivity(
        'Provisioned Persistence Tier: PostgreSQL 16 Primary (Standalone)',
        'agent',
        'Notice: Unsecured plaintext connection wired'
      );
      await new Promise((r) => setTimeout(r, 1800));

      // Step 4: WebMCP Agent queries canvas://audit-report via W3C WebMCP
      logActivity(
        'Phase 2/5: Agent inspecting canvas://audit-report via W3C WebMCP...',
        'agent',
        'Linter detected violations: SPOF (No DB replica), Plaintext Transport Risk, and Uncached DB Bottleneck.'
      );
      await new Promise((r) => setTimeout(r, 2200));

      // Step 5: WebMCP Agent calls auto_remediate_violation for SPOF
      logActivity(
        'Phase 3/5: Agent invoking auto_remediate_violation("violation-spof-pg-primary")...',
        'agent',
        'Provisioning hot standby replica with PostgreSQL streaming replication.'
      );
      await new Promise((r) => setTimeout(r, 1800));

      addServiceNode('pg-standby', 'PostgreSQL Standby Replica', 'database', 'persistence', 'agent');
      connectServices('pg-primary', 'pg-standby', 'PostgreSQL Streaming Replication', true, 'agent');
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 1500));

      // Step 6: WebMCP Agent calls auto_remediate_violation for Plaintext channel
      logActivity(
        'Agent invoking auto_remediate_violation for unencrypted transport channel...',
        'agent',
        'Upgrading payment-svc -> pg-primary to PostgreSQL Wire (TLS Encrypted).'
      );
      await new Promise((r) => setTimeout(r, 1500));

      updateEdge('e-payment-svc-pg-primary', {
        protocol: 'PostgreSQL Wire (TLS)',
        isEncrypted: true,
        port: '5432',
      });
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 1600));

      // Step 7: WebMCP Agent calls auto_remediate_violation for Performance Bottleneck (Uncached DB Queries)
      logActivity(
        'Phase 4/5: Agent resolving performance warning: inserting Redis caching tier...',
        'agent',
        'Provisioning Redis Cluster Cache to eliminate direct database read bottleneck on payment-svc.'
      );
      await new Promise((r) => setTimeout(r, 1600));

      addServiceNode('redis-cache', 'Redis Cluster Cache', 'cache', 'persistence', 'agent');
      connectServices('payment-svc', 'redis-cache', 'Redis RESP3 (TLS)', true, 'agent');
      autoLayout('LR');
      await new Promise((r) => setTimeout(r, 1600));

      // Step 8: Final verification
      logActivity(
        'Phase 5/5: Security & Performance posture verified — 0 violations, 100% compliant, cached & redundant.',
        'agent',
        'All rules passed: Multi-AZ database redundancy, Redis caching tier, and end-to-end TLS encryption active.'
      );
    } finally {
      setIsSimulating(false);
    }
  }, [
    isSimulating,
    clearCanvas,
    addServiceNode,
    connectServices,
    updateEdge,
    autoLayout,
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
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
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

        {/* Floating Interactive Guide: Overview, How-To, and WebMCP */}
        <AppGuideCard />

        {/* Unified Bottom Dock: Diagnostics & Violations + WebMCP Telemetry */}
        <BottomDiagnosticsDock />

        {/* Connection Properties / Cryptography Modal */}
        <EdgeConfigModal />

        {/* WebMCP Topology Snapshot Modal */}
        <TopologySnapshotModal
          isOpen={isTopologyOpen}
          onClose={() => setIsTopologyOpen(false)}
        />
      </div>
    </main>
  );
}
