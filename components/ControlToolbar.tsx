'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  Share2,
  Radio,
  GitFork,
  Sparkles,
  RotateCcw,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Code2,
  ChevronDown,
  Layers,
  Database,
  Cpu,
  Upload,
  Download,
} from 'lucide-react';
import { NodeSpawnerModal } from './NodeSpawnerModal';
import { ImportTopologyModal } from './ImportTopologyModal';

interface ControlToolbarProps {
  onRunSimulation: () => void;
  isSimulating: boolean;
  onOpenTopology: () => void;
}

export function ControlToolbar({
  onRunSimulation,
  isSimulating,
  onOpenTopology,
}: ControlToolbarProps) {
  const {
    nodes,
    edges,
    autoLayout,
    clearCanvas,
    loadPreset,
    getTopologySnapshot,
    exportTopology,
  } = useCanvasStore();

  const [isSpawnerOpen, setIsSpawnerOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const snapshot = getTopologySnapshot();
  const { criticalRisks, warningRisks, securityScore, unsecuredEdges } = snapshot.metrics;
  const totalThreats = criticalRisks + warningRisks + (unsecuredEdges || 0);

  const handleExportJson = () => {
    const data = exportTopology();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphweave-topology-${Date.now().toString(36)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between bg-zinc-950/90 backdrop-blur-xl z-20 select-none">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 shadow-inner">
            <Share2 className="w-4 h-4 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                GraphWeave
                <span className="text-[11px] font-sans px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-normal">
                  v1.0
                </span>
              </h1>
              <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 font-sans font-normal items-center gap-1.5">
                <Radio className="w-2.5 h-2.5 text-emerald-400" /> WebMCP Active
              </span>
            </div>
            <p className="hidden md:block text-xs text-zinc-400">
              Architecture & STRIDE Threat-Modeling Canvas for W3C WebMCP
            </p>
          </div>
        </div>

        {/* Center: Live Architecture Metrics */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Nodes:</span>
            <span className="font-medium text-zinc-100">{nodes.length}</span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Edges:</span>
            <span className="font-medium text-zinc-100">{edges.length}</span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Threats:</span>
            <span
              className={`font-medium flex items-center gap-1 ${
                criticalRisks > 0
                  ? 'text-rose-400'
                  : warningRisks > 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {totalThreats > 0 ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              {totalThreats}
            </span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Posture:</span>
            <span
              className={`font-medium ${
                securityScore >= 80
                  ? 'text-emerald-400'
                  : securityScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {securityScore}%
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Preset Templates Selector */}
          <div className="relative">
            <button
              onClick={() => setIsPresetsOpen(!isPresetsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Presets</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isPresetsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsPresetsOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] uppercase font-mono text-zinc-400 font-bold">
                  Reference Architectures
                </div>
                <button
                  onClick={() => loadPreset('ecommerce')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-zinc-100">PCI-DSS E-Commerce</span>
                  <span className="text-[10px] text-zinc-400">WAF, Vault, Tokenizer & PostgreSQL</span>
                </button>
                <button
                  onClick={() => loadPreset('rag')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-zinc-100">GenAI RAG Pipeline</span>
                  <span className="text-[10px] text-zinc-400">AI Gateway, LangGraph & Qdrant</span>
                </button>
                <button
                  onClick={() => loadPreset('microservices')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-zinc-100">Event Microservices Mesh</span>
                  <span className="text-[10px] text-zinc-400">Kong, Kafka, Workers & Redis</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Component Button */}
          <button
            onClick={() => setIsSpawnerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {/* Auto Layout */}
          <button
            onClick={() => autoLayout('LR')}
            title="Re-balance topology with Dagre layout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition active:scale-98"
          >
            <GitFork className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Auto-Layout</span>
          </button>

          {/* Import Topology */}
          <button
            onClick={() => setIsImportOpen(true)}
            title="Import topology from JSON file or manifest"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition active:scale-98"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Export Topology */}
          <button
            onClick={handleExportJson}
            title="Export architecture topology to JSON file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* WebMCP Topology JSON Snapshot Inspector */}
          <button
            onClick={onOpenTopology}
            title="Inspect canvas://topology WebMCP resource snapshot"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80 transition"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Simulate Agentic Run (Hero Action with Rich Tooltip) */}
          <div className="relative group/sim">
            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm ${
                isSimulating
                  ? 'bg-zinc-800 cursor-not-allowed text-zinc-400 border border-zinc-700'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-zinc-900/20'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-zinc-400' : 'text-zinc-950'}`} />
              <span>{isSimulating ? 'Agent Executing...' : 'Simulate Agentic Run'}</span>
            </button>

            {/* Rich Explanatory Tooltip for Users & Hackathon Judges */}
            <div className="pointer-events-none absolute right-0 top-full mt-2 w-80 opacity-0 group-hover/sim:opacity-100 transition-all duration-200 translate-y-1 group-hover/sim:translate-y-0 z-50">
              <div className="p-3 rounded-xl bg-zinc-900/98 border border-zinc-700/80 shadow-2xl shadow-black/80 backdrop-blur-xl text-left">
                <div className="flex items-center gap-1.5 text-zinc-100 text-xs font-semibold pb-1.5 border-b border-zinc-800">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>What is &ldquo;Simulate Agentic Run&rdquo;?</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mt-2 font-normal">
                  Simulates what happens when a user instructs an AI agent via <strong className="text-white font-medium">W3C WebMCP</strong>:
                </p>
                <div className="mt-1.5 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 font-mono text-[10.5px] text-sky-300 leading-normal">
                  &ldquo;Design a secure PCI-DSS e-commerce backend with zero plaintext channels, database failover, and high-throughput caching.&rdquo;
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-normal mt-2">
                  The agent dynamically provisions nodes, listens to the <strong className="text-zinc-300">Architecture Linter</strong> (<span className="font-mono text-zinc-300">canvas://audit-report</span>), and autonomously self-heals SPOFs, transport encryption, and bottlenecks using WebMCP tools.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Canvas */}
          <button
            onClick={clearCanvas}
            title="Reset Canvas"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 border border-zinc-800/80 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Node Spawner Modal */}
      <NodeSpawnerModal
        isOpen={isSpawnerOpen}
        onClose={() => setIsSpawnerOpen(false)}
      />

      {/* Import Topology Modal */}
      <ImportTopologyModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}
