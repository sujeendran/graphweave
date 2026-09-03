'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import {
  Cloud,
  Cpu,
  Database,
  Layers,
  HardDrive,
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ServiceNodeData, useCanvasStore } from '@/store/useCanvasStore';

const iconMap = {
  gateway: Cloud,
  compute: Cpu,
  database: Database,
  queue: Layers,
  cache: Zap,
  storage: HardDrive,
};

const tierColors = {
  edge: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40',
  application: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
  persistence: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
};

const threatStyles = {
  none: 'border-slate-800/90 bg-slate-900/90 hover:border-slate-700 shadow-xl shadow-slate-950/60',
  low: 'border-sky-500/80 bg-sky-950/30 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500/30',
  medium: 'border-amber-500/80 bg-amber-950/40 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40',
  critical:
    'border-rose-500 bg-rose-950/60 shadow-2xl shadow-rose-950/60 ring-2 ring-rose-500/50 animate-pulse',
};

export const CustomServiceNode = memo(({ id, data, selected }: NodeProps<Node<ServiceNodeData>>) => {
  const { resolveThreat, removeNode, setSelectedNodeId } = useCanvasStore();
  const Icon = iconMap[data.type] || Cpu;
  const isThreatened = data.threatLevel && data.threatLevel !== 'none';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      className={`group relative min-w-[230px] max-w-[270px] px-3.5 py-3 rounded-xl border transition-all duration-200 backdrop-blur-md cursor-pointer ${
        threatStyles[data.threatLevel || 'none']
      } ${selected ? 'ring-2 ring-indigo-400 border-indigo-400' : ''}`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-400 border-2 !border-slate-950 -ml-1.5 transition-transform hover:scale-125"
      />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              isThreatened && data.threatLevel === 'critical'
                ? 'bg-rose-900/40 border-rose-500/60 text-rose-400'
                : isThreatened && data.threatLevel === 'medium'
                ? 'bg-amber-900/40 border-amber-500/60 text-amber-400'
                : 'bg-slate-800/90 border-slate-700/80 text-indigo-400'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                {data.type}
              </span>
              {data.tier && (
                <span
                  className={`text-[8px] uppercase px-1 py-0.2 rounded border font-mono ${
                    tierColors[data.tier] || tierColors.application
                  }`}
                >
                  {data.tier}
                </span>
              )}
            </div>
            <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[140px]" title={data.label}>
              {data.label}
            </h4>
          </div>
        </div>

        {/* Quick Delete Node Action on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          title="Delete service"
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1 -mr-1 rounded hover:bg-slate-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Threat Status & Remediation Banner */}
      {isThreatened ? (
        <div
          className={`mt-2.5 pt-2 border-t flex flex-col gap-1 text-[11px] ${
            data.threatLevel === 'critical'
              ? 'border-rose-900/60 text-rose-300'
              : 'border-amber-900/60 text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
              {data.threatLevel === 'critical' ? (
                <ShieldAlert className="w-3 h-3 text-rose-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              )}
              {data.category || 'Vulnerability'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resolveThreat(id);
              }}
              title="Auto-remediate vulnerability"
              className="text-[10px] bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 transition shadow-sm"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Remediate
            </button>
          </div>
          {data.threatDescription && (
            <p className="text-slate-300 text-[10px] leading-tight line-clamp-2">
              {data.threatDescription}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400/90 font-mono text-[9px]">
            <ShieldCheck className="w-2.5 h-2.5" /> Posture: Healthy
          </span>
          <span className="text-[9px] text-slate-500 font-mono">ID: {id}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-400 border-2 !border-slate-950 -mr-1.5 transition-transform hover:scale-125"
      />
    </div>
  );
});

CustomServiceNode.displayName = 'CustomServiceNode';
