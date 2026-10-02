import React, { useState } from 'react';
import { COPILOT_FEED } from '../../data/resortData';
import { Sparkles, Activity, BedDouble, Wrench, Package, Check, ArrowRight } from 'lucide-react';
import { ZoneId } from '../../types';
import { AICopilotModal } from '../ai/AICopilotModal';

interface IntelligenceSectionProps {
  onSelectZone: (zone: ZoneId) => void;
}

export const IntelligenceSection: React.FC<IntelligenceSectionProps> = ({ onSelectZone }) => {
  const [selectedFeedId, setSelectedFeedId] = useState(COPILOT_FEED[0].id);
  const activeFeed = COPILOT_FEED.find((f) => f.id === selectedFeedId) || COPILOT_FEED[0];
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const handleSelectInsight = (feedItem: typeof COPILOT_FEED[0]) => {
    setSelectedFeedId(feedItem.id);
    setActionConfirmed(false);
    if (feedItem.villa === 'Villa 12' || feedItem.villa === 'Villa 04') {
      onSelectZone('ocean-villas');
    } else if (feedItem.villa === 'The Obsidian') {
      onSelectZone('culinary-pavilion');
    } else if (feedItem.villa.includes('Pool')) {
      onSelectZone('infinity-pool');
    }
  };

  return (
    <section id="intelligence" className="relative min-h-screen w-full flex items-center px-6 md:px-16 py-24 z-10">
      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-[#c8aa6e] font-mono">
            <span>02. INTELLIGENCE</span>
            <span className="w-6 h-[1px] bg-[#c8aa6e]/40" />
            <span>PREDICTIVE COGNITION</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-normal tracking-[-0.02em] leading-[1.05] text-[#EDEDED] font-editorial text-balance">
            THE RESORT
            <br />
            <span className="text-neutral-400">THAT THINKS AHEAD.</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
            AI transforms operational data into actionable decisions across rooms, guests, housekeeping, maintenance and inventory. The property anticipates needs before guests speak them.
          </p>
        </div>

        {/* AI RESORT COPILOT INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Copilot Console */}
          <div className="lg:col-span-8 bg-[#07080a]/85 backdrop-blur-2xl border border-white/[0.09] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Subtle luxury champagne accent bar at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent opacity-75" />

            {/* Console Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm tracking-[0.22em] uppercase font-semibold text-white font-editorial">
                    AI RESORT COPILOT
                  </span>
                  <Sparkles className="w-4 h-4 text-[#c8aa6e]" />
                </div>
                <div className="text-xs text-neutral-400 font-mono tracking-wider mt-1">
                  AUTONOMOUS DISPATCH & SYNAPTIC COGNITION
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#050505] bg-[#c8aa6e] hover:bg-[#d8bc7f] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(200,170,110,0.3)] font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#050505]" />
                  <span>Launch Copilot</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#EDEDED]">
                    SYSTEM ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Core Telemetry Grid (Required: Occupancy 84%, Housekeeping 7 pending, Maintenance 3 active, Inventory 2 low-stock) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs uppercase tracking-wider">Occupancy</span>
                  <Activity className="w-3.5 h-3.5 text-[#c8aa6e]" />
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white font-mono tabular-nums">
                  84%
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                  15 / 18 Keys In Residence
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs uppercase tracking-wider">Housekeeping</span>
                  <BedDouble className="w-3.5 h-3.5 text-[#c8aa6e]" />
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white font-mono tabular-nums">
                  7
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Tasks Pending
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs uppercase tracking-wider">Maintenance</span>
                  <Wrench className="w-3.5 h-3.5 text-[#c8aa6e]" />
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white font-mono tabular-nums">
                  3
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Active Issues
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs uppercase tracking-wider">Inventory</span>
                  <Package className="w-3.5 h-3.5 text-[#c8aa6e]" />
                </div>
                <div className="text-3xl sm:text-4xl font-light text-white font-mono tabular-nums">
                  2
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Low-Stock Items
                </div>
              </div>
            </div>

            {/* AI INSIGHT HIGHLIGHT BOX */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-[#c8aa6e]/30 relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-mono text-[#c8aa6e]">
                  <span>AI INSIGHT</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-400">{activeFeed.type}</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">{activeFeed.time}</span>
              </div>

              <blockquote className="text-lg sm:text-xl md:text-2xl font-normal text-white font-editorial leading-snug">
                &ldquo;{activeFeed.insight}&rdquo;
              </blockquote>

              <p className="mt-3 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                {activeFeed.reason}
              </p>

              <div className="mt-6 pt-4 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span>TARGET ENTITY:</span>
                  <span className="text-white font-medium">{activeFeed.villa}</span>
                </div>

                <button
                  onClick={() => setActionConfirmed(true)}
                  disabled={actionConfirmed}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    actionConfirmed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] shadow-[0_0_16px_rgba(200,170,110,0.3)]'
                  }`}
                >
                  {actionConfirmed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ORDER EXECUTED</span>
                    </>
                  ) : (
                    <>
                      <span>{activeFeed.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 text-center tracking-wider pt-2">
              VISUAL COGNITIVE PROTOTYPE · HEURISTIC SYNCHRONIZATION ACTIVE
            </div>
          </div>

          {/* Right Column: Interactive Copilot Insights Stream */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-[0.2em] font-mono text-neutral-400">
                LIVE INFERENCE FEED
              </span>
              <span className="text-[11px] font-mono text-[#c8aa6e]">REAL-TIME</span>
            </div>

            <div className="space-y-3">
              {COPILOT_FEED.map((feed) => {
                const isActive = feed.id === selectedFeedId;
                return (
                  <button
                    key={feed.id}
                    onClick={() => handleSelectInsight(feed)}
                    className={`w-full text-left p-4 transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.08] border-[#c8aa6e]/60 shadow-[0_0_20px_rgba(200,170,110,0.12)]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                      <span className={isActive ? 'text-[#c8aa6e]' : 'text-neutral-400'}>
                        {feed.type}
                      </span>
                      <span>{feed.time}</span>
                    </div>

                    <div className="text-xs sm:text-sm font-medium text-white line-clamp-2 leading-relaxed">
                      {feed.insight}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">{feed.villa}</span>
                      <span className="text-[#c8aa6e]">{feed.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Live AI Resort Copilot & Intelligence Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        userRole="GENERAL_MANAGER"
      />
    </section>
  );
};
