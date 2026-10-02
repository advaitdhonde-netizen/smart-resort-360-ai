import React from 'react';
import { ChevronDown, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeroSectionProps {
  onExplore: () => void;
  onToggleFreeOrbit?: () => void;
  isFreeOrbit?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onToggleFreeOrbit, isFreeOrbit }) => {
  const { isLight } = useTheme();

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 px-6 md:px-16 pointer-events-none select-none">
      {/* Top Status & Architectural Coordinate Header */}
      <div
        className={`flex items-center justify-between text-xs tracking-[0.2em] uppercase font-mono max-w-7xl mx-auto w-full ${
          isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-2 h-2 rounded-full animate-pulse ${
              isLight
                ? 'bg-[#2D5A3E] shadow-[0_0_8px_rgba(45,90,62,0.6)]'
                : 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
            }`}
          />
          <span className={`font-semibold tracking-[0.25em] ${isLight ? 'text-[#18251F]' : 'text-[#EDEDED]'}`}>
            SYSTEM ACTIVE
          </span>
          <span className={`hidden sm:inline ${isLight ? 'text-[#7D8C7C]' : 'text-neutral-600'}`}>·</span>
          <span className={`hidden sm:inline ${isLight ? 'text-[#36443D] font-medium' : 'text-neutral-500'}`}>
            RESORT ENGINE v4.2 PRO
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-6 ${isLight ? 'text-[#4D5C4D] font-medium' : 'text-neutral-500'}`}>
          <span>LAT 08°39&apos;N</span>
          <span>·</span>
          <span>LON 115°13&apos;E</span>
          <span>·</span>
          <span className={isLight ? 'text-[#18251F]' : 'text-neutral-400'}>ISLAND ARCHIPELAGO</span>
        </div>
      </div>

      {/* Main Hero Typography: Apple presentation meets luxury architectural monograph */}
      <div className="max-w-7xl mx-auto w-full my-auto py-12">
        <div className="relative max-w-4xl space-y-8">
          {/* Subtle Translucent Readability Protection Layer (Light Theme Only) */}
          {isLight && (
            <div
              className="absolute pointer-events-none -z-10 transition-opacity duration-500
                -inset-x-4 -inset-y-8
                sm:-inset-y-12 sm:-left-12 sm:right-auto sm:w-[130%]
                lg:-inset-y-16 lg:-left-16 lg:w-[145%]
                rounded-[2.5rem]
              "
              style={{
                background:
                  'radial-gradient(ellipse 90% 80% at 24% 48%, rgba(229, 226, 214, 0.88) 0%, rgba(229, 226, 214, 0.68) 40%, rgba(220, 217, 204, 0.35) 68%, transparent 100%)',
                filter: 'blur(22px)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Metadata Badges / Labels */}
          <div
            className={`inline-flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase font-semibold ${
              isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
            }`}
            style={
              isLight
                ? {
                    textShadow: '0 1px 2px rgba(229, 226, 214, 0.9)',
                  }
                : undefined
            }
          >
            <span>ENTERPRISE ARCHITECTURE</span>
            <span className={`w-6 sm:w-8 h-[1px] ${isLight ? 'bg-[#8F6834]/50' : 'bg-[#c8aa6e]/50'}`} />
            <span>FULL DEPLOYMENT READY</span>
          </div>

          {/* Primary Hero Heading */}
          <h1
            className={`text-5xl sm:text-7xl lg:text-8xl tracking-[-0.03em] leading-[0.94] font-editorial text-balance ${
              isLight
                ? 'font-medium text-[#18251F]'
                : 'font-normal text-[#EDEDED]'
            }`}
            style={
              isLight
                ? {
                    textShadow:
                      '0 1px 2px rgba(229, 226, 214, 0.95), 0 2px 8px rgba(220, 217, 204, 0.75), 0 4px 16px rgba(229, 226, 214, 0.5)',
                  }
                : undefined
            }
          >
            THE LIVING
            <br />
            <span
              className={
                isLight
                  ? 'text-[#18251F]'
                  : 'bg-gradient-to-r from-white via-[#EDEDED] to-neutral-500 bg-clip-text text-transparent'
              }
            >
              ARCHITECTURE.
            </span>
          </h1>

          {/* Hero Paragraph */}
          <p
            className={`max-w-xl text-base sm:text-lg leading-relaxed tracking-wide ${
              isLight
                ? 'text-[#39453F] font-normal'
                : 'text-neutral-400 font-light'
            }`}
            style={
              isLight
                ? {
                    textShadow:
                      '0 1px 2px rgba(229, 226, 214, 0.9), 0 2px 6px rgba(229, 226, 214, 0.5)',
                  }
                : undefined
            }
          >
            A unified digital operating system for the world&apos;s most intelligent resorts. Real-time spatial twin, predictive operations, and sentient hospitality in one living architecture.
          </p>

          {/* Interactive controls affordance */}
          <div className="pt-4 flex flex-wrap items-center gap-6 pointer-events-auto">
            <button
              onClick={onExplore}
              className={`group flex items-center gap-3 text-xs tracking-[0.2em] uppercase transition-colors cursor-pointer py-2 ${
                isLight ? 'text-[#18251F] hover:text-[#8F6834]' : 'text-[#EDEDED] hover:text-[#c8aa6e]'
              }`}
            >
              <span className="font-medium">EXPLORE PLATFORM</span>
              <span
                className={`w-6 h-[1px] group-hover:w-10 transition-all ${
                  isLight ? 'bg-[#39453F] group-hover:bg-[#8F6834]' : 'bg-neutral-600 group-hover:bg-[#c8aa6e]'
                }`}
              />
            </button>

            {onToggleFreeOrbit && (
              <button
                onClick={onToggleFreeOrbit}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase font-mono transition-colors cursor-pointer border ${
                  isLight
                    ? 'text-[#26332D] hover:text-[#18251F] bg-[#EEECE4]/90 hover:bg-[#EEECE4] border-[#B8AD9B] shadow-sm'
                    : 'text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                }`}
                title="Toggle 360 degree free orbit inspection with mouse"
              >
                <Compass
                  className={`w-3.5 h-3.5 ${
                    isFreeOrbit
                      ? (isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]')
                      : (isLight ? 'text-[#4D5C4D]' : 'text-neutral-400')
                  }`}
                />
                <span className="font-medium">{isFreeOrbit ? 'EXIT 360° ORBIT' : '360° INSPECT TWIN'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Bottom: Scroll Indicator & Property Footprint */}
      <div
        className={`max-w-7xl mx-auto w-full flex items-end justify-between pt-6 border-t ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.06]'
        }`}
      >
        <div
          className={`hidden sm:block text-xs font-mono tracking-wider ${
            isLight ? 'text-[#36443D] font-medium' : 'text-neutral-500'
          }`}
        >
          <span>SPATIAL COVERAGE: 48 HECTARES</span>
          <span className="mx-2">·</span>
          <span>18 OVERWATER RESIDENCES</span>
        </div>

        <button
          onClick={onExplore}
          className={`flex items-center gap-3 text-xs tracking-[0.25em] uppercase transition-colors cursor-pointer pointer-events-auto mx-auto sm:mx-0 group py-2 ${
            isLight ? 'text-[#26332D] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span className="font-mono text-[11px] font-medium">SCROLL TO EXPLORE</span>
          <ChevronDown
            className={`w-4 h-4 animate-bounce group-hover:translate-y-1 transition-transform ${
              isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
            }`}
          />
        </button>
      </div>
    </section>
  );
};

