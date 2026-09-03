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
} from 'lucide-react';
import { NodeSpawnerModal } from './NodeSpawnerModal';

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
  } = useCanvasStore();

  const [isSpawnerOpen, setIsSpawnerOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const snapshot = getTopologySnapshot();
  const { criticalRisks, warningRisks, securityScore } = snapshot.metrics;
  const totalThreats = criticalRisks + warningRisks;

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between bg-slate-950/90 backdrop-blur-xl z-20 select-none">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 ring-1 ring-white/10">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                GraphWeave
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-medium">
                  v1.0
                </span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> WebMCP Active
              </span>
            </div>
            <p className="hidden md:block text-[10.5px] text-slate-400">
              Agentic Architecture & STRIDE Threat-Modeling Canvas for W3C WebMCP
            </p>
          </div>
        </div>

        {/* Center: Live Architecture Metrics */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Nodes:</span>
            <span className="font-bold text-indigo-400">{nodes.length}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Edges:</span>
            <span className="font-bold text-indigo-400">{edges.length}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Threats:</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                criticalRisks > 0
                  ? 'text-rose-400 animate-pulse'
                  : warningRisks > 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {totalThreats > 0 ? (
                <ShieldAlert className="w-3 h-3" />
              ) : (
                <ShieldCheck className="w-3 h-3" />
              )}
              {totalThreats}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Posture:</span>
            <span
              className={`font-bold ${
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPresetsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsPresetsOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Reference Architectures
                </div>
                <button
                  onClick={() => loadPreset('ecommerce')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-slate-100">PCI-DSS E-Commerce</span>
                  <span className="text-[10px] text-slate-500">WAF, Vault, Tokenizer & PostgreSQL</span>
                </button>
                <button
                  onClick={() => loadPreset('rag')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-slate-100">GenAI RAG Pipeline</span>
                  <span className="text-[10px] text-slate-500">AI Gateway, LangGraph & Qdrant</span>
                </button>
                <button
                  onClick={() => loadPreset('microservices')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition flex flex-col"
                >
                  <span className="font-semibold text-slate-100">Event Microservices Mesh</span>
                  <span className="text-[10px] text-slate-500">Kong, Kafka, Workers & Redis</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Component Button */}
          <button
            onClick={() => setIsSpawnerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {/* Auto Layout */}
          <button
            onClick={() => autoLayout('LR')}
            title="Re-balance topology with Dagre layout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition active:scale-98"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Layout</span>
          </button>

          {/* WebMCP Topology JSON Snapshot Inspector */}
          <button
            onClick={onOpenTopology}
            title="Inspect canvas://topology WebMCP resource snapshot"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Simulate Agentic Run (Devpost Demo Hero Feature) */}
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg transition active:scale-95 ${
              isSimulating
                ? 'bg-indigo-900 cursor-not-allowed text-indigo-300 ring-1 ring-indigo-700'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Agent Executing...' : 'Simulate Agentic Run'}</span>
          </button>

          {/* Reset Canvas */}
          <button
            onClick={clearCanvas}
            title="Reset Canvas"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
    </>
  );
}
