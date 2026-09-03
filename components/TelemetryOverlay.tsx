'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Play, ChevronDown, ChevronUp, Trash2, Activity, Cpu, User } from 'lucide-react';

export function TelemetryOverlay() {
  const { activities, logActivity } = useCanvasStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-200 pointer-events-auto bg-zinc-900/95 border border-zinc-800 rounded-xl backdrop-blur-xl shadow-2xl flex flex-col ${
        isCollapsed ? 'w-64 h-9' : 'w-[560px] max-w-[92vw] max-h-72'
      }`}
    >
      {/* Header */}
      <div className="h-9 px-3.5 flex items-center justify-between border-b border-zinc-800 cursor-pointer select-none">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-400" /> WebMCP Telemetry
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {activities.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isCollapsed && activities.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                useCanvasStore.setState({ activities: [] });
              }}
              title="Clear telemetry logs"
              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs font-sans scrollbar-thin divide-y divide-zinc-800/40">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              <p>Awaiting WebMCP client or agent actions...</p>
              <p className="text-[11px] text-zinc-600 mt-1">Tools are registered and listening on navigator.modelContext</p>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="pt-1.5 first:pt-0 flex flex-col gap-0.5 text-zinc-300">
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-zinc-500 font-mono">{act.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                      act.source === 'agent'
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    }`}
                  >
                    {act.source === 'agent' ? (
                      <>
                        <Cpu className="w-2.5 h-2.5 text-zinc-400" /> Agent
                      </>
                    ) : (
                      <>
                        <User className="w-2.5 h-2.5 text-emerald-400" /> User
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs leading-snug break-words text-zinc-200">
                  {act.action}
                </p>
                {act.details && (
                  <pre className="text-[10px] text-zinc-400 bg-zinc-950/90 p-1.5 rounded border border-zinc-800/80 overflow-x-auto font-mono">
                    {act.details}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
