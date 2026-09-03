'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { X, Copy, Check, Radio, FileCode2 } from 'lucide-react';

interface TopologySnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopologySnapshotModal({ isOpen, onClose }: TopologySnapshotModalProps) {
  const { getTopologySnapshot } = useCanvasStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const snapshot = getTopologySnapshot();
  const jsonString = JSON.stringify(snapshot, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-4 relative max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-800 text-zinc-200 rounded-xl border border-zinc-700">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">WebMCP Resource: canvas://topology</h3>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 flex items-center gap-1.5">
                  <Radio className="w-2 h-2 text-emerald-400" /> Live Feed
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Synchronous JSON-RPC payload read by AI agents during threat-modeling evaluations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800/90 font-mono text-xs text-zinc-300 leading-relaxed scrollbar-thin">
          <pre>{jsonString}</pre>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 font-sans pt-1">
          <span>MIME: application/json</span>
          <span>Nodes: {snapshot.metrics.nodeCount} · Edges: {snapshot.metrics.edgeCount} · Posture: {snapshot.metrics.securityScore}/100</span>
        </div>
      </div>
    </div>
  );
}
