'use client';

import React, { useState } from 'react';
import { useCanvasStore, ThreatLevel } from '@/store/useCanvasStore';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

const strideCategories = [
  { value: 'SPOF', label: 'Denial of Service (SPOF - No Standby Replica)' },
  { value: 'Unencrypted', label: 'Information Disclosure (Unencrypted Channel)' },
  { value: 'DDoS_Risk', label: 'Denial of Service (Unauthenticated Public Endpoint)' },
  { value: 'Data_Breach', label: 'Tampering / Elevation of Privilege (Privileged SA)' },
];

export function ThreatModal() {
  const { nodes, selectedNodeId, setSelectedNodeId, flagThreat, resolveThreat } = useCanvasStore();
  const [selectedRisk, setSelectedRisk] = useState<ThreatLevel>('critical');
  const [selectedCat, setSelectedCat] = useState('SPOF');
  const [threatDesc, setThreatDesc] = useState(
    'Single Point of Failure: No active standby replica or failover pool.'
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const data = selectedNode.data;
  const isThreatened = data.threatLevel !== 'none';

  const handleApplyThreat = () => {
    flagThreat(selectedNode.id, selectedRisk, threatDesc, selectedCat);
  };

  const handleResolve = () => {
    resolveThreat(selectedNode.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedNodeId(null)}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                data.threatLevel === 'critical'
                  ? 'bg-rose-950/50 border-rose-700/70 text-rose-400'
                  : data.threatLevel === 'medium'
                  ? 'bg-amber-950/50 border-amber-700/70 text-amber-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              {isThreatened ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {data.type}
                </span>
                <span className="text-xs text-zinc-500 font-mono">id: {selectedNode.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{data.label}</h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Status Panel */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            data.threatLevel === 'critical'
              ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
              : data.threatLevel === 'medium'
              ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
              : data.threatLevel === 'low'
              ? 'bg-sky-950/20 border-sky-900/50 text-sky-200'
              : 'bg-zinc-950/60 border-zinc-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              {isThreatened ? (
                <>
                  <AlertTriangle className="w-4 h-4" /> Threat Detected: {data.threatLevel.toUpperCase()}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Security State: Protected
                </>
              )}
            </span>
            {data.category && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                {data.category}
              </span>
            )}
          </div>

          {data.threatDescription ? (
            <p className="text-xs leading-relaxed text-zinc-200 mt-1">{data.threatDescription}</p>
          ) : (
            <p className="text-xs text-zinc-400">
              No active STRIDE vulnerabilities or unencrypted vectors flagged for this service.
            </p>
          )}

          {isThreatened && (
            <button
              onClick={handleResolve}
              className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Trigger Automated Remediation & Secure Channels
            </button>
          )}
        </div>

        {/* Manual STRIDE Threat Simulation / Testing */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" /> STRIDE Threat Simulator (Testing Tool)
            </span>
            <span className="text-[10px] text-zinc-500">Simulate agent tool calls</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Risk Level
              </label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value as ThreatLevel)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="critical">Critical (P0)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                STRIDE Category
              </label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  const matched = strideCategories.find((c) => c.value === e.target.value);
                  if (matched) setThreatDesc(matched.label);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {strideCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Threat Description
            </label>
            <textarea
              rows={2}
              value={threatDesc}
              onChange={(e) => setThreatDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none font-sans"
            />
          </div>

          <button
            onClick={handleApplyThreat}
            className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Apply Threat Flag (Agent Action)
          </button>
        </div>
      </div>
    </div>
  );
}
