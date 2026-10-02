import React from 'react';
import { ArrowRight, Globe, Shield, Cpu } from 'lucide-react';

interface FinalSectionProps {
  onEnter: () => void;
}

export const FinalSection: React.FC<FinalSectionProps> = ({ onEnter }) => {
  return (
    <footer className="relative min-h-screen w-full flex flex-col justify-between px-6 md:px-16 py-28 z-10 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto w-full my-auto space-y-12">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.28em] uppercase text-[#c8aa6e] font-mono">
            <span>FULL DEPLOYMENT READY</span>
            <span className="w-8 h-[1px] bg-[#c8aa6e]/50" />
            <span>ENTERPRISE ARCHITECTURE</span>
          </div>

          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-[-0.03em] leading-[0.96] text-[#EDEDED] font-editorial text-balance">
            YOUR RESORT.
            <br />
            <span className="text-neutral-400">ONE INTELLIGENT SYSTEM.</span>
          </h2>

          <p className="max-w-xl text-lg sm:text-xl text-neutral-300 font-light leading-relaxed">
            Smart Resort 360 brings the entire property into one living digital environment. Where spatial awareness meets autonomous luxury hospitality.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6">
            <button
              onClick={onEnter}
              className="px-8 py-4 text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold text-[#050505] bg-[#c8aa6e] hover:bg-[#d8bc7f] transition-all duration-300 cursor-pointer shadow-[0_0_36px_rgba(200,170,110,0.35)] hover:shadow-[0_0_50px_rgba(200,170,110,0.55)] flex items-center gap-3 group"
            >
              <span>ENTER SMART RESORT 360</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Architectural Specifications Grid */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/[0.08]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-neutral-400">
              <Globe className="w-3.5 h-3.5 text-[#c8aa6e]" />
              <span>Multi-Property Mesh</span>
            </div>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Interconnected telemetry spans island archipelagos, alpine retreats, and urban sanctuary portfolios with unified governance.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-[#c8aa6e]" />
              <span>Sovereign Privacy Guardrails</span>
            </div>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Biometric profiles and VIP travel manifests remain cryptographically partitioned within on-premise hardware security enclaves.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-neutral-400">
              <Cpu className="w-3.5 h-3.5 text-[#c8aa6e]" />
              <span>Zero-Latency Edge Inference</span>
            </div>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Microsecond response loops for villa comfort balancing, chiller diagnostics, and silent guest service coordination.
            </p>
          </div>
        </div>
      </div>

      {/* Quiet Editorial Footer */}
      <div className="max-w-7xl mx-auto w-full pt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/[0.06] text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-4">
          <span className="font-editorial text-sm tracking-widest text-[#EDEDED]">SMART RESORT 360</span>
          <span>·</span>
          <span>THE LIVING ARCHITECTURE.</span>
        </div>

        <div className="flex items-center gap-6">
          <span>ALL RIGHTS RESERVED © 2026</span>
          <span>·</span>
          <span className="text-[#c8aa6e]">CONFIDENTIAL ENTERPRISE PREVIEW</span>
        </div>
      </div>
    </footer>
  );
};
