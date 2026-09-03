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
  edge: 'text-zinc-300 border-zinc-700/70 bg-zinc-800/60',
  application: 'text-sky-300 border-sky-800/60 bg-sky-950/40',
  persistence: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40',
};

const threatStyles = {
  none: 'border-zinc-800/90 bg-zinc-900/95 hover:border-zinc-700 shadow-md shadow-black/40',
  low: 'border-sky-700/80 bg-zinc-900/95 shadow-md shadow-sky-950/20 ring-1 ring-sky-500/30',
  medium: 'border-amber-600/80 bg-zinc-900/95 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/30',
  critical:
    'border-rose-600/90 bg-zinc-900/95 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40',
};

export const CustomServiceNode = memo(({ id, data, selected }: NodeProps<Node<ServiceNodeData>>) => {
  const { resolveThreat, removeNode, setSelectedNodeId } = useCanvasStore();
  const Icon = iconMap[data.type] || Cpu;
  const isThreatened = data.threatLevel && data.threatLevel !== 'none';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      className={`group relative min-w-[245px] max-w-[285px] p-3.5 rounded-xl border transition-all duration-150 backdrop-blur-md cursor-pointer ${
        threatStyles[data.threatLevel || 'none']
      } ${selected ? 'ring-2 ring-zinc-300 border-zinc-300' : ''}`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-zinc-400 border-2 !border-zinc-950 -ml-1.5 transition-all hover:scale-125 hover:!bg-sky-400"
      />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              isThreatened && data.threatLevel === 'critical'
                ? 'bg-rose-950/40 border-rose-700/60 text-rose-400'
                : isThreatened && data.threatLevel === 'medium'
                ? 'bg-amber-950/40 border-amber-700/60 text-amber-400'
                : 'bg-zinc-800/80 border-zinc-700/70 text-zinc-300'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-zinc-100 truncate" title={data.label}>
              {data.label}
            </h4>
            <p className="text-xs text-zinc-400 capitalize flex items-center gap-1 mt-0.5 font-normal">
              <span>{data.type}</span>
              {data.tier && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{data.tier}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Delete Node Action on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          title="Delete service"
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition p-1 -mr-1 rounded hover:bg-zinc-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Threat Status & Remediation Banner */}
      {isThreatened ? (
        <div
          className={`mt-3 pt-2.5 border-t flex flex-col gap-1.5 text-xs ${
            data.threatLevel === 'critical'
              ? 'border-rose-900/40 text-rose-300'
              : 'border-amber-900/40 text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-xs">
              {data.threatLevel === 'critical' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              {data.category || 'Vulnerability'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resolveThreat(id);
              }}
              title="Auto-remediate vulnerability"
              className="text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-md flex items-center gap-1 transition shadow-sm font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Remediate
            </button>
          </div>
          {data.threatDescription && (
            <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2 font-normal">
              {data.threatDescription}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Protected
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">{id}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-zinc-400 border-2 !border-zinc-950 -mr-1.5 transition-all hover:scale-125 hover:!bg-sky-400"
      />
    </div>
  );
});

CustomServiceNode.displayName = 'CustomServiceNode';
