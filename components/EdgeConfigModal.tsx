'use client';

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Lock,
  Unlock,
  Network,
  Check,
} from 'lucide-react';

const PROTOCOL_PRESETS = [
  { name: 'HTTPS / REST', defaultPort: '443', defaultEncrypted: true, desc: 'Standard encrypted web & API transport' },
  { name: 'gRPC / HTTP2', defaultPort: '50051', defaultEncrypted: true, desc: 'High-performance microservice RPC (mTLS)' },
  { name: 'WebSocket (WSS)', defaultPort: '443', defaultEncrypted: true, desc: 'Bidirectional encrypted streaming' },
  { name: 'PostgreSQL Wire', defaultPort: '5432', defaultEncrypted: true, desc: 'Relational database client channel' },
  { name: 'Redis RESP3', defaultPort: '6379', defaultEncrypted: true, desc: 'In-memory cache & PubSub channel' },
  { name: 'Kafka Event Bus', defaultPort: '9092', defaultEncrypted: true, desc: 'Distributed event streaming (TLS/SASL)' },
  { name: 'TCP Plaintext', defaultPort: '8080', defaultEncrypted: false, desc: 'Unsecured raw socket (Security Risk)' },
];

export function EdgeConfigModal() {
  const { nodes, edges, selectedEdgeId, setSelectedEdgeId, updateEdge, removeEdge } = useCanvasStore();

  const edge = edges.find((e) => e.id === selectedEdgeId);
  const sourceNode = edge ? nodes.find((n) => n.id === edge.source) : undefined;
  const targetNode = edge ? nodes.find((n) => n.id === edge.target) : undefined;

  const edgeData = edge?.data as { protocol?: string; port?: string; isEncrypted?: boolean } | undefined;

  const [protocol, setProtocol] = useState('HTTPS / REST');
  const [port, setPort] = useState('443');
  const [isEncrypted, setIsEncrypted] = useState(true);

  useEffect(() => {
    if (edge) {
      const p = edgeData?.protocol || (typeof edge.label === 'string' ? edge.label : 'HTTPS / REST');
      const enc = edgeData?.isEncrypted !== undefined ? edgeData.isEncrypted : edge.style?.stroke !== '#f43f5e';
      setProtocol(p);
      setPort(edgeData?.port || '443');
      setIsEncrypted(enc);
    }
  }, [edge, edgeData]);

  if (!selectedEdgeId || !edge) return null;

  const handleSelectPreset = (preset: typeof PROTOCOL_PRESETS[number]) => {
    setProtocol(preset.name);
    setPort(preset.defaultPort);
    setIsEncrypted(preset.defaultEncrypted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEdge(selectedEdgeId, {
      protocol: protocol.trim() || 'HTTPS',
      port: port.trim() || undefined,
      isEncrypted,
    });
  };

  const handleDelete = () => {
    removeEdge(selectedEdgeId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setSelectedEdgeId(null)}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Connection Properties</h3>
              <p className="text-xs text-zinc-400">Define transport protocol, port, and cryptographic boundary</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEdgeId(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source -> Target Visual Breadcrumb */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 font-sans">Source</span>
            <span className="font-medium text-zinc-200 truncate max-w-[170px]" title={sourceNode?.data.label}>
              {sourceNode?.data.label || edge.source}
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-500 px-2">
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[11px] text-zinc-500 font-sans">Destination</span>
            <span className="font-medium text-zinc-200 truncate max-w-[170px]" title={targetNode?.data.label}>
              {targetNode?.data.label || edge.target}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Quick Protocol Presets */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Protocol Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROTOCOL_PRESETS.map((preset) => {
                const isActive = protocol === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex flex-col p-2.5 rounded-lg text-left text-xs border transition ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-600 text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/90 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-zinc-200">{preset.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Protocol Name & Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Protocol Label
              </label>
              <input
                type="text"
                required
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                placeholder="e.g. gRPC, HTTPS, Redis"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Port (optional)
              </label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="e.g. 443"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>
          </div>

          {/* Encryption / Security Mode Toggle */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Transport Cryptography
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEncrypted(true)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition ${
                  isEncrypted
                    ? 'bg-sky-950/40 border-sky-600/50 text-sky-300 font-medium'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <Lock className={`w-4 h-4 ${isEncrypted ? 'text-sky-400' : 'text-zinc-500'}`} />
                <div>
                  <p className="font-medium">Encrypted (TLS / mTLS)</p>
                  <p className="text-[10px] text-zinc-400">Protects against eavesdropping</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsEncrypted(false)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition ${
                  !isEncrypted
                    ? 'bg-rose-950/40 border-rose-600/50 text-rose-300 font-medium'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                }`}
              >
                <Unlock className={`w-4 h-4 ${!isEncrypted ? 'text-rose-400' : 'text-zinc-500'}`} />
                <div>
                  <p className="font-medium">Plaintext (Unsecured)</p>
                  <p className="text-[10px] text-zinc-400">STRIDE data exposure risk</p>
                </div>
              </button>
            </div>

            {!isEncrypted && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 flex items-start gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Traffic between these services is not encrypted in transit. This will be flagged as an unencrypted boundary threat and lowers the architecture security score.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition border border-rose-900/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Connection
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedEdgeId(null)}
                className="px-3.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Save Connection
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
