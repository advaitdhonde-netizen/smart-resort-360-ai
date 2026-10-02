import React from 'react';
import { RESORT_ZONES } from '../../data/resortData';
import { ZoneId } from '../../types';
import { Layers, Crosshair, ArrowUpRight } from 'lucide-react';

interface DigitalTwinSectionProps {
  activeZone: ZoneId | null;
  onSelectZone: (zone: ZoneId) => void;
}

export const DigitalTwinSection: React.FC<DigitalTwinSectionProps> = ({
  activeZone,
  onSelectZone,
}) => {
  return (
    <section id="digital-twin" className="relative min-h-screen w-full flex items-center px-6 md:px-16 py-24 z-10">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Editorial Headline & Narrative */}
        <div className="lg:col-span-6 space-y-8">
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-[#c8aa6e] font-mono">
            <span>01. DIGITAL TWIN</span>
            <span className="w-6 h-[1px] bg-[#c8aa6e]/40" />
            <span>SYNCHRONOUS MESH</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-normal tracking-[-0.02em] leading-[1.05] text-[#EDEDED] font-editorial text-balance">
            SEE THE RESORT.
            <br />
            <span className="text-neutral-400">UNDERSTAND THE OPERATION.</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-xl">
            Every room, facility and operational zone exists inside a living digital representation of the resort. Continuous telemetry from sub-millimeter sensors mirrors physical architecture into computational precision.
          </p>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-white/[0.08]">
            <div className="space-y-1">
              <div className="text-2xl font-normal text-white font-mono tabular-nums">480ms</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400">Mesh Refresh Cycle</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-normal text-white font-mono tabular-nums">1,240</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400">Telemetry Nodes</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-normal text-[#c8aa6e] font-mono tabular-nums">100%</div>
              <div className="text-xs uppercase tracking-wider text-neutral-400">Spatial Synchrony</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Spatial Zone Selector */}
        <div className="lg:col-span-6">
          <div className="bg-[#08090c]/75 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-mono text-neutral-400">
                <Layers className="w-4 h-4 text-[#c8aa6e]" />
                <span>SPATIAL ZONES INSPECTOR</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">6 ACTIVE CORES</span>
            </div>

            <p className="text-xs text-neutral-400 font-light">
              Select an architectural zone to pivot the spatial camera and inspect real-time operational status.
            </p>

            <div className="space-y-2">
              {RESORT_ZONES.map((zone) => {
                const isSelected = activeZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => onSelectZone(zone.id)}
                    className={`w-full text-left p-4 transition-all duration-200 border cursor-pointer group ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#c8aa6e]/60 shadow-[0_0_20px_rgba(200,170,110,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crosshair className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-[#c8aa6e]' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                        <div>
                          <div className={`text-sm tracking-wide font-medium transition-colors ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                            {zone.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono tracking-wider">
                            {zone.category} · Occupancy {zone.occupancy}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 ${
                          zone.operationalStatus === 'Attention'
                            ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                            : 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                        }`}>
                          {zone.operationalStatus}
                        </span>
                        <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#c8aa6e] translate-x-0.5 -translate-y-0.5' : 'text-neutral-400 group-hover:translate-x-0.5'}`} />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-neutral-300 font-light leading-relaxed animate-fadeIn">
                        {zone.description}
                        <div className="mt-2 text-[11px] font-mono text-[#c8aa6e] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c8aa6e] animate-ping" />
                          <span>{zone.currentActivity}</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
