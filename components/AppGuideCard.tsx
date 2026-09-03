'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function AppGuideCard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'webmcp'>('overview');

  if (!isExpanded) {
    return (
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/95 border border-zinc-800 text-xs text-zinc-200 backdrop-blur-md shadow-xl hover:bg-zinc-800 hover:border-zinc-700 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium">Guide: What is GraphWeave?</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-auto bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl max-w-sm hidden sm:flex flex-col gap-3 text-zinc-200 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div>
          <p className="text-[11px] text-zinc-400">Guide: What is GraphWeave?</p>
        </div>

        <button
          onClick={() => setIsExpanded(false)}
          title="Minimize guide"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-lg border border-zinc-800/90 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1 px-2 rounded-md text-center text-[11px] transition ${
            activeTab === 'overview'
              ? 'bg-zinc-800 text-white font-medium shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 py-1 px-2 rounded-md text-center text-[11px] transition ${
            activeTab === 'workflow'
              ? 'bg-zinc-800 text-white font-medium shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          How to Use
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('webmcp')}
          className={`flex-1 py-1 px-2 rounded-md text-center text-[11px] transition ${
            activeTab === 'webmcp'
              ? 'bg-zinc-800 text-white font-medium shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          AI & WebMCP
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-xs text-zinc-300 leading-relaxed min-h-[95px]">
        {activeTab === 'overview' && (
          <div className="space-y-2">
            <p className="text-[11.5px] text-zinc-300">
              <strong className="text-white font-medium">GraphWeave</strong> is an interactive cloud architecture studio with a built-in <strong className="text-zinc-100">Real-Time Architecture Linter</strong>.
            </p>
            <p className="text-[11px] text-zinc-400">
              Unlike static diagrams, GraphWeave continuously checks your system for Single Points of Failure (SPOFs), unencrypted data in transit, and public database exposure — offering instant 1-click remediations.
            </p>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">1</span>
              <span><strong>Design</strong>: Click <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">+ Add Node</code> or drag handles between services to build your system.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">2</span>
              <span><strong>Real-Time Linter</strong>: As you build, flaws (SPOFs, unencrypted channels) are flagged automatically in the bottom Diagnostics tab.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">3</span>
              <span><strong>1-Click Quick Fixes</strong>: Click the suggested fixes on any violation to provision replicas or secure links instantly.</span>
            </div>
          </div>
        )}

        {activeTab === 'webmcp' && (
          <div className="space-y-2 text-[11px]">
            <p className="text-zinc-300">
              GraphWeave exposes standard tools (<code className="text-sky-300 font-mono text-[10.5px]">run_architecture_audit</code>, <code className="text-sky-300 font-mono text-[10.5px]">auto_remediate_violation</code>) on <code className="text-sky-300 bg-zinc-950 px-1 py-0.5 rounded font-mono">document.modelContext</code>.
            </p>
            <p className="text-zinc-400">
              External AI agents can inspect <code className="text-zinc-300 font-mono">canvas://audit-report</code> and autonomously heal systems on your behalf.
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Visual Legend */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 font-sans">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Encrypted (TLS)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Plaintext Risk</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Linter Warning</span>
        </span>
      </div>
    </div>
  );
}
