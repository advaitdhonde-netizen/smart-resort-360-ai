import React, { useState } from 'react';
import { X, Cpu, Check, Activity, ShieldCheck, Thermometer, Users } from 'lucide-react';
import { RESORT_ZONES } from '../../data/resortData';
import { ZoneId } from '../../types';

interface LaunchOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zone: ZoneId) => void;
}

export const LaunchOSModal: React.FC<LaunchOSModalProps> = ({
  isOpen,
  onClose,
  onSelectZone,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'protocols'>('telemetry');
  const [executedCommands, setExecutedCommands] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleExecute = (cmdId: string) => {
    setExecutedCommands((prev) => ({ ...prev, [cmdId]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#050505]/90 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#090b10] border border-white/[0.1] shadow-[0_0_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Metallic Border Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#c8aa6e]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-xl font-editorial tracking-wider text-white">
                  SMART RESORT 360 KERNEL
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                PROPERTY RUNTIME ENVIRONMENT · CENTRAL ARCHITECTURAL SYNAPSE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.06] hover:border-white/20"
            aria-label="Close OS Console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pt-4 border-b border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 px-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              activeTab === 'telemetry'
                ? 'border-[#c8aa6e] text-white font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            SPATIAL TELEMETRY MATRIX
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`pb-3 px-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              activeTab === 'protocols'
                ? 'border-[#c8aa6e] text-white font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            AUTONOMOUS PROTOCOLS
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'telemetry' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>ALL SENSORY DOMAINS CALIBRATED</span>
                <span>SAMPLING RATE: 100Hz</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RESORT_ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-colors space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{zone.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                          {zone.category}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                        zone.operationalStatus === 'Attention'
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-emerald-400 bg-emerald-400/10'
                      }`}>
                        {zone.operationalStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/[0.05]">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Users className="w-3.5 h-3.5 text-[#c8aa6e]" />
                        <span>Occ: {zone.occupancy}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Thermometer className="w-3.5 h-3.5 text-[#c8aa6e]" />
                        <span>Temp: 22.1°C</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400 font-light border-t border-white/[0.05] pt-2">
                      {zone.currentActivity}
                    </div>

                    <button
                      onClick={() => {
                        onSelectZone(zone.id);
                        onClose();
                      }}
                      className="w-full py-1.5 text-[11px] tracking-wider uppercase font-mono text-[#c8aa6e] hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer text-center"
                    >
                      Focus 3D Twin View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-mono text-neutral-400">
                SIMULATE EXECUTABLE ARCHITECTURAL DISPATCH
              </div>

              {[
                {
                  id: 'cmd-1',
                  name: 'Prioritize Villa 12 Turndown Service',
                  zone: 'Overwater Villa Enclave',
                  description: 'Dispatches Team Delta with linen kit and luxury bath ritual setup before 3:00 PM flight arrival.',
                  impact: 'Readiness ETA: 14:45 (-15 min ahead of target)',
                },
                {
                  id: 'cmd-2',
                  name: 'Pre-cool Horizon Infinity Terrace Loungers',
                  zone: 'Horizon Pool',
                  description: 'Activates subterranean shade louvers and activates microclimate misting nozzles.',
                  impact: 'Ambient heat index reduced by 3.2°C',
                },
                {
                  id: 'cmd-3',
                  name: 'Reserve Chateau Margaux 2010 for Table 7',
                  zone: 'The Obsidian Restaurant',
                  description: 'Transfers vintage cellar bottle to decanting chamber at steady 16°C.',
                  impact: 'Optimal aeration curve matched for 20:15 seating',
                },
              ].map((cmd) => {
                const isDone = executedCommands[cmd.id];
                return (
                  <div
                    key={cmd.id}
                    className="p-5 bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{cmd.name}</span>
                        <span className="text-[11px] font-mono text-[#c8aa6e]">{cmd.zone}</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light">{cmd.description}</p>
                      <div className="text-[11px] font-mono text-neutral-400">{cmd.impact}</div>
                    </div>

                    <button
                      onClick={() => handleExecute(cmd.id)}
                      disabled={isDone}
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] font-semibold'
                      }`}
                    >
                      {isDone ? (
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> DISPATCHED
                        </span>
                      ) : (
                        'TRIGGER PROTOCOL'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 sm:p-8 border-t border-white/[0.08] flex items-center justify-between bg-black/40 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ENCRYPTED SECURE HARDWARE ENCLAVE</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono tracking-wider uppercase text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          >
            RETURN TO EXPLORATION
          </button>
        </div>
      </div>
    </div>
  );
};
