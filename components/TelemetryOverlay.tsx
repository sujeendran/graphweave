'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Play, ChevronDown, ChevronUp, Trash2, Terminal, Bot, User } from 'lucide-react';

export function TelemetryOverlay() {
  const { activities, logActivity } = useCanvasStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed bottom-4 right-4 z-30 transition-all duration-300 pointer-events-auto bg-slate-900/95 border border-slate-800/90 rounded-xl backdrop-blur-xl shadow-2xl flex flex-col ${
        isCollapsed ? 'w-72 h-10' : 'w-96 max-h-80'
      }`}
    >
      {/* Header */}
      <div className="h-10 px-3.5 flex items-center justify-between border-b border-slate-800/80 cursor-pointer select-none">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" /> WebMCP Telemetry Stream
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({activities.length})
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
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-[11px] font-mono scrollbar-thin divide-y divide-slate-800/40">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-slate-500 italic text-[11px]">
              <p>Awaiting WebMCP client or agent actions...</p>
              <p className="text-[10px] text-slate-600 mt-1">Tools are registered and listening on navigator.modelContext</p>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="pt-1.5 first:pt-0 flex flex-col gap-0.5 text-slate-300">
                <div className="flex items-center justify-between gap-1 text-[9px]">
                  <span className="text-slate-500 font-mono">{act.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${
                      act.source === 'agent'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {act.source === 'agent' ? (
                      <>
                        <Bot className="w-2.5 h-2.5" /> Agent (WebMCP)
                      </>
                    ) : (
                      <>
                        <User className="w-2.5 h-2.5" /> Human
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[10.5px] leading-snug break-words text-slate-200 font-sans">
                  {act.action}
                </p>
                {act.details && (
                  <pre className="text-[9px] text-slate-400 bg-slate-950/80 p-1 rounded border border-slate-800 overflow-x-auto">
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
