'use client';

import React, { useState } from 'react';
import { useCanvasStore, ServiceType } from '@/store/useCanvasStore';
import { Plus, X, Cloud, Cpu, Database, Layers, Zap, HardDrive } from 'lucide-react';

const serviceTypes: { type: ServiceType; label: string; icon: React.ElementType }[] = [
  { type: 'gateway', label: 'API Gateway / Ingress', icon: Cloud },
  { type: 'compute', label: 'Compute / Microservice', icon: Cpu },
  { type: 'database', label: 'Database (SQL/NoSQL)', icon: Database },
  { type: 'queue', label: 'Message Queue / Bus', icon: Layers },
  { type: 'cache', label: 'Memory Cache (Redis)', icon: Zap },
  { type: 'storage', label: 'Blob / Object Storage', icon: HardDrive },
];

interface NodeSpawnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NodeSpawnerModal({ isOpen, onClose }: NodeSpawnerModalProps) {
  const { addServiceNode } = useCanvasStore();
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('compute');
  const [tier, setTier] = useState<'edge' | 'application' | 'persistence'>('application');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !label.trim()) return;
    addServiceNode(id.trim().toLowerCase().replace(/\s+/g, '-'), label.trim(), serviceType, tier, 'human');
    setId('');
    setLabel('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Spawn Service Node</h3>
              <p className="text-[11px] text-zinc-400">Add an architectural component to the topology</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Service ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. k8s-worker-pool"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kubernetes Worker Cluster"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-sans"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Service Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map(({ type, label: typeLabel, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setServiceType(type)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition ${
                    serviceType === type
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-950 font-medium shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{typeLabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              Tier Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['edge', 'application', 'persistence'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTier(t)}
                  className={`py-1.5 px-2 rounded-lg text-center text-xs capitalize border transition ${
                    tier === t
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-950 font-medium shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Component to Canvas
          </button>
        </form>
      </div>
    </div>
  );
}
