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
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                data.threatLevel === 'critical'
                  ? 'bg-rose-950/60 border-rose-500/80 text-rose-400'
                  : data.threatLevel === 'medium'
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-400'
                  : 'bg-indigo-950/60 border-indigo-500/60 text-indigo-400'
              }`}
            >
              {isThreatened ? (
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {data.type}
                </span>
                <span className="text-xs text-slate-500 font-mono">id: {selectedNode.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{data.label}</h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Status Panel */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            data.threatLevel === 'critical'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : data.threatLevel === 'medium'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : data.threatLevel === 'low'
              ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
              : 'bg-slate-800/40 border-slate-700/60 text-emerald-300'
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                {data.category}
              </span>
            )}
          </div>

          {data.threatDescription ? (
            <p className="text-xs leading-relaxed text-slate-200 mt-1">{data.threatDescription}</p>
          ) : (
            <p className="text-xs text-slate-400">
              No active STRIDE vulnerabilities or unencrypted vectors flagged for this service.
            </p>
          )}

          {isThreatened && (
            <button
              onClick={handleResolve}
              className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Trigger Automated Remediation & Secure Channels
            </button>
          )}
        </div>

        {/* Manual STRIDE Threat Simulation / Testing */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> STRIDE Threat Simulator (Testing Tool)
            </span>
            <span className="text-[10px] text-slate-500">Simulate agent tool calls</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Risk Level
              </label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value as ThreatLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="critical">Critical (P0)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                STRIDE Category
              </label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  const matched = strideCategories.find((c) => c.value === e.target.value);
                  if (matched) setThreatDesc(matched.label);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              Threat Description
            </label>
            <textarea
              rows={2}
              value={threatDesc}
              onChange={(e) => setThreatDesc(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>

          <button
            onClick={handleApplyThreat}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Apply Threat Flag (Agent Action)
          </button>
        </div>
      </div>
    </div>
  );
}
