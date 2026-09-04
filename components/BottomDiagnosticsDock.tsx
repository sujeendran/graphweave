'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  Terminal,
  ChevronUp,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Lock,
  Database,
  ArrowRight,
} from 'lucide-react';

export function BottomDiagnosticsDock() {
  const {
    nodes,
    edges,
    activities,
    logActivity,
    getAuditReport,
    applyQuickFix,
    setSelectedNodeId,
    setSelectedEdgeId,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'telemetry'>('diagnostics');
  const [isExpanded, setIsExpanded] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const report = getAuditReport();
  const { violations, criticalCount, warningCount, infoCount } = report;

  const filteredViolations = violations.filter((v) => {
    if (severityFilter === 'critical') return v.severity === 'critical';
    if (severityFilter === 'warning') return v.severity === 'warning';
    return true;
  });

  const handleSelectViolation = (nodeIds: string[], edgeIds: string[]) => {
    if (nodeIds.length > 0) {
      setSelectedNodeId(nodeIds[0]);
    } else if (edgeIds.length > 0) {
      setSelectedEdgeId(edgeIds[0]);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-3 pointer-events-auto select-none">
      <div className="bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200">
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-3.5 py-2 bg-zinc-950/60 ${
            isExpanded ? 'border-b border-zinc-800/70' : ''
          }`}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            {/* Diagnostics Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'diagnostics') {
                  setIsExpanded(!isExpanded);
                } else {
                  setActiveTab('diagnostics');
                  setIsExpanded(true);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'diagnostics'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {criticalCount > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                ) : warningCount > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
                <span>Architecture Diagnostics</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                  violations.length > 0
                    ? 'bg-rose-950/70 text-rose-300 border-rose-800/50'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                }`}
              >
                {violations.length}
              </span>
            </button>

            {/* WebMCP Telemetry Tab */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'telemetry') {
                  setIsExpanded(!isExpanded);
                } else {
                  setActiveTab('telemetry');
                  setIsExpanded(true);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'telemetry'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>WebMCP Telemetry</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {activities.length}
              </span>
            </button>
          </div>

          {/* Right Controls: Minimize/Expand */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title={isExpanded ? 'Minimize drawer' : 'Expand drawer'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="max-h-64 min-h-[140px] overflow-y-auto p-3 text-xs divide-y divide-zinc-800/50 scrollbar-thin">
            {/* TAB 1: DIAGNOSTICS & VIOLATIONS */}
            {activeTab === 'diagnostics' && (
              <div>
                {/* Filter Pills */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-zinc-400 mr-1">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setSeverityFilter('all')}
                      className={`px-2 py-0.5 rounded ${
                        severityFilter === 'all'
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      All ({violations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverityFilter('critical')}
                      className={`px-2 py-0.5 rounded ${
                        severityFilter === 'critical'
                          ? 'bg-rose-950/60 text-rose-300 font-medium'
                          : 'text-zinc-400 hover:text-rose-300'
                      }`}
                    >
                      Critical ({criticalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeverityFilter('warning')}
                      className={`px-2 py-0.5 rounded ${
                        severityFilter === 'warning'
                          ? 'bg-amber-950/60 text-amber-300 font-medium'
                          : 'text-zinc-400 hover:text-amber-300'
                      }`}
                    >
                      Warnings ({warningCount})
                    </button>
                  </div>

                  <span className="text-[10px] text-zinc-400">
                    Real-Time Linter: Continuous STRIDE Evaluation
                  </span>
                </div>

                {/* Empty State: Resilient Architecture */}
                {violations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-zinc-400 gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs font-medium text-emerald-300">
                      Architecture is Resilient & Compliant
                    </span>
                    <p className="text-[11px] text-zinc-400 max-w-sm">
                      Zero linter violations detected. All persistence tiers are redundant, transport boundaries enforce TLS, and ingress is isolated.
                    </p>
                  </div>
                )}

                {/* Violations List */}
                <div className="space-y-2">
                  {filteredViolations.map((violation) => (
                    <div
                      key={violation.id}
                      onClick={() => handleSelectViolation(violation.nodeIds, violation.edgeIds)}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {violation.severity === 'critical' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            ) : violation.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            ) : (
                              <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-100 text-xs">
                                {violation.title}
                              </span>
                              <span
                                className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded border ${
                                  violation.severity === 'critical'
                                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                                    : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                }`}
                              >
                                {violation.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
                              {violation.description}
                            </p>
                            {violation.complianceImpact && (
                              <span className="inline-block text-[10px] text-zinc-400 font-mono mt-1">
                                🛡️ {violation.complianceImpact}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Quick Fix Button */}
                        {violation.quickFix && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyQuickFix(violation.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition shadow-sm flex-shrink-0 active:scale-95"
                          >
                            <Sparkles className="w-3 h-3 text-zinc-950" />
                            <span>{violation.quickFix.label}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: WEBMCP TELEMETRY */}
            {activeTab === 'telemetry' && (
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-sky-900/40 flex items-center justify-between gap-3 text-[11px] font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-300">
                      Standard Interface:{' '}
                      <code className="text-sky-300 font-mono text-[11px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        document.modelContext.registerTool()
                      </code>
                    </span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[10px] bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                    12 Tools Active
                  </span>
                </div>

                {activities.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500">No telemetry logged yet</div>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-start justify-between gap-3 text-zinc-300"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-[10px]">{act.timestamp}</span>
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded border font-sans font-medium ${
                              act.source === 'human'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {act.source === 'human' ? 'User' : 'Agent'}
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-200 mt-1 truncate">{act.action}</p>
                        {act.details && (
                          <pre className="text-[10px] text-zinc-400 mt-1 whitespace-pre-wrap font-mono break-all">
                            {act.details}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
