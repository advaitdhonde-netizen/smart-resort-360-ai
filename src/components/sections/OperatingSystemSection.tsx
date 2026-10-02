import React, { useState } from 'react';
import { useResortOS } from '../../context/ResortOSContext';
import { useAuth } from '../../context/AuthContext';
import { OPERATIONAL_AREAS } from '../../data/resortData';
import { OperationalAreaId, ZoneId } from '../../types';
import { ArrowUpRight, CheckCircle2, Shield, ExternalLink } from 'lucide-react';

interface OperatingSystemSectionProps {
  onSelectZone: (zone: ZoneId) => void;
}

export const OperatingSystemSection: React.FC<OperatingSystemSectionProps> = ({ onSelectZone }) => {
  const { openOS } = useResortOS();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedAreaId, setSelectedAreaId] = useState<OperationalAreaId>('reservations');
  const activeArea = OPERATIONAL_AREAS.find((a) => a.id === selectedAreaId) || OPERATIONAL_AREAS[0];

  const handleLaunchModule = (areaId: OperationalAreaId) => {
    if (!isAuthenticated) {
      openAuthModal('staff');
    } else {
      openOS(areaId);
    }
  };

  const handleSelect = (area: typeof OPERATIONAL_AREAS[0]) => {
    setSelectedAreaId(area.id);
    onSelectZone(area.targetZone);
  };

  return (
    <section id="operations" className="relative min-h-screen w-full flex items-center px-6 md:px-16 py-28 z-10">
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-[#c8aa6e] font-mono">
            <span>03. ONE OPERATING SYSTEM</span>
            <span className="w-6 h-[1px] bg-[#c8aa6e]/40" />
            <span>12 UNIFIED DISCIPLINES</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-normal tracking-[-0.02em] leading-[1.05] text-[#EDEDED] font-editorial text-balance">
            EVERYTHING
            <br />
            <span className="text-neutral-400">CONNECTED.</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
            Twelve discrete hospitality disciplines unified under a single operating fabric. When occupancy shifts in Reservations, Housekeeping, Energy, Gastronomy, and Concierge rebalance autonomously.
          </p>
        </div>

        {/* Master Architectural Index Layout (12 Disciplines) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-6 border-t border-white/[0.08]">
          {/* Left Column: Typographic Department Directory (12 Modules) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 pb-2">
              <span>OPERATIONAL ENGINES</span>
              <span>12 DISCIPLINES</span>
            </div>

            <div className="divide-y divide-white/[0.06] max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
              {OPERATIONAL_AREAS.map((area) => {
                const isSelected = area.id === selectedAreaId;
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSelect(area)}
                    className="w-full text-left py-3.5 px-2 group flex items-center justify-between transition-all duration-200 cursor-pointer focus-visible:outline-none"
                  >
                    <div className="flex items-baseline gap-3.5 truncate">
                      <span className={`text-xs font-mono tracking-widest transition-colors ${
                        isSelected ? 'text-[#c8aa6e]' : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}>
                        {area.index}
                      </span>
                      <span className={`text-base sm:text-lg font-editorial tracking-[0.06em] truncate transition-all ${
                        isSelected
                          ? 'text-white translate-x-1 font-medium'
                          : 'text-neutral-400 group-hover:text-white'
                      }`}>
                        {area.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline text-xs font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">
                        {area.liveMetric}
                      </span>
                      <span className={`w-2 h-2 rounded-full transition-all ${
                        isSelected ? 'bg-[#c8aa6e] scale-125' : 'bg-transparent border border-white/20 group-hover:border-white/50'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Architectural Focus Pane */}
          <div className="lg:col-span-7 bg-[#07090c]/85 backdrop-blur-2xl border border-white/[0.08] p-8 sm:p-10 space-y-8 shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="text-xs uppercase font-mono tracking-[0.22em] text-[#c8aa6e]">
                  {activeArea.index} · {activeArea.category}
                </div>
                <h3 className="text-2xl sm:text-3xl font-editorial text-white tracking-wide mt-1">
                  {activeArea.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLaunchModule(activeArea.id)}
                  className="px-4 py-2 bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(200,170,110,0.25)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Module in OS</span>
                </button>
                <button
                  onClick={() => onSelectZone(activeArea.targetZone)}
                  className="p-2 border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Locate on 3D Twin"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#c8aa6e]" />
                </button>
              </div>
            </div>

            {/* Tagline & Core Narrative */}
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-neutral-200 uppercase tracking-wider font-mono">
                {activeArea.tagline}
              </div>
              <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
                {activeArea.description}
              </p>
            </div>

            {/* Live Operational Velocity Metric */}
            <div className="p-5 bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                  {activeArea.metricLabel}
                </div>
                <div className="text-2xl sm:text-3xl font-light text-white font-mono tabular-nums mt-1">
                  {activeArea.liveMetric}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  AUTONOMOUS SYNAPSE ONLINE
                </span>
                <div className="text-xs text-neutral-500 font-mono mt-1">
                  Node Latency: 14ms
                </div>
              </div>
            </div>

            {/* Autonomous Orchestration Workflows */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
                ACTIVE WORKFLOW PIPELINES
              </div>
              <ul className="space-y-2">
                {activeArea.keyWorkflows.map((workflow, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300 font-light">
                    <CheckCircle2 className="w-4 h-4 text-[#c8aa6e] shrink-0 mt-0.5" />
                    <span>{workflow}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Authorized Roles Footer */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-neutral-400">
                <Shield className="w-3.5 h-3.5 text-[#c8aa6e]" />
                <span>AUTHORIZED ROLES:</span>
                <span className="text-neutral-300">
                  {activeArea.authorizedRoles.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
