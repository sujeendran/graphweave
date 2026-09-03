'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Upload, X, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';

interface ImportTopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportTopologyModal({ isOpen, onClose }: ImportTopologyModalProps) {
  const { importTopology } = useCanvasStore();
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      validateAndPreview(content);
    };
    reader.readAsText(file);
  };

  const validateAndPreview = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        setStatusMessage({ type: 'error', text: 'JSON is missing a "nodes" array.' });
        return;
      }
      setStatusMessage({
        type: 'success',
        text: `Ready to import: ${parsed.nodes.length} nodes, ${(parsed.edges || []).length} edges.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format';
      setStatusMessage({ type: 'error', text: `Syntax error: ${message}` });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    if (val.trim()) {
      validateAndPreview(val);
    } else {
      setStatusMessage(null);
    }
  };

  const handleImport = () => {
    if (!jsonText.trim()) return;

    try {
      const parsed = JSON.parse(jsonText);
      const result = importTopology(parsed);
      if (result.success) {
        onClose();
        setJsonText('');
        setStatusMessage(null);
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Import failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Invalid JSON string.' });
    }
  };

  const loadSample = (type: 'microservices' | 'simple') => {
    const sample =
      type === 'microservices'
        ? {
            nodes: [
              { id: 'gw', label: 'API Gateway', type: 'gateway', tier: 'edge', threatLevel: 'none' },
              { id: 'auth', label: 'Auth Service', type: 'compute', tier: 'application', threatLevel: 'none' },
              { id: 'orders', label: 'Orders API', type: 'compute', tier: 'application', threatLevel: 'none' },
              { id: 'db', label: 'Postgres DB', type: 'database', tier: 'persistence', threatLevel: 'critical', threatDescription: 'SPOF' },
            ],
            edges: [
              { source: 'gw', target: 'auth', label: 'HTTPS (TLS)', data: { protocol: 'HTTPS', isEncrypted: true } },
              { source: 'gw', target: 'orders', label: 'HTTPS (TLS)', data: { protocol: 'HTTPS', isEncrypted: true } },
              { source: 'orders', target: 'db', label: 'TCP Plaintext', data: { protocol: 'TCP', isEncrypted: false } },
            ],
          }
        : {
            nodes: [
              { id: 'cdn', label: 'Global CDN', type: 'gateway', tier: 'edge', threatLevel: 'none' },
              { id: 'app', label: 'Web Server', type: 'compute', tier: 'application', threatLevel: 'none' },
            ],
            edges: [
              { source: 'cdn', target: 'app', label: 'HTTPS / TLS', data: { protocol: 'HTTPS', isEncrypted: true } },
            ],
          };

    const str = JSON.stringify(sample, null, 2);
    setJsonText(str);
    validateAndPreview(str);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-4 relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Import Topology</h3>
              <p className="text-xs text-zinc-400">Load an architecture manifest from JSON or upload a file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Button & Sample Shortcuts */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer transition">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Choose .json file</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Or try sample:</span>
            <button
              type="button"
              onClick={() => loadSample('microservices')}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700/60 transition"
            >
              Microservices
            </button>
            <button
              type="button"
              onClick={() => loadSample('simple')}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700/60 transition"
            >
              Simple CDN
            </button>
          </div>
        </div>

        {/* JSON Editor Textarea */}
        <div className="flex-1 flex flex-col gap-1.5">
          <textarea
            rows={10}
            value={jsonText}
            onChange={handleTextChange}
            placeholder={`Paste GraphWeave topology JSON here, e.g.:\n{\n  "nodes": [...],\n  "edges": [...]\n}`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none leading-relaxed scrollbar-thin"
          />

          {statusMessage && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!jsonText.trim() || statusMessage?.type === 'error'}
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>Load into Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
