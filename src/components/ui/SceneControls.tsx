import React from 'react';
import { Sun, Moon, Sunset, Compass, RotateCcw } from 'lucide-react';
import { LightingMode } from '../../types';

interface SceneControlsProps {
  lightingMode: LightingMode;
  onChangeLighting: (mode: LightingMode) => void;
  isFreeOrbit: boolean;
  onToggleFreeOrbit: () => void;
  onResetView: () => void;
}

export const SceneControls: React.FC<SceneControlsProps> = ({
  lightingMode,
  onChangeLighting,
  isFreeOrbit,
  onToggleFreeOrbit,
  onResetView,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-1.5 bg-[#08090c]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
      {/* Lighting Mode Selector */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/[0.08]">
        <button
          onClick={() => onChangeLighting('dawn')}
          className={`p-2 transition-colors cursor-pointer ${
            lightingMode === 'dawn' ? 'text-[#c8aa6e] bg-white/[0.06]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Dawn Lighting"
          aria-label="Dawn Lighting"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChangeLighting('twilight')}
          className={`p-2 transition-colors cursor-pointer ${
            lightingMode === 'twilight' ? 'text-[#c8aa6e] bg-white/[0.06]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Twilight Lighting"
          aria-label="Twilight Lighting"
        >
          <Sunset className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChangeLighting('midnight')}
          className={`p-2 transition-colors cursor-pointer ${
            lightingMode === 'midnight' ? 'text-[#c8aa6e] bg-white/[0.06]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Midnight Lighting"
          aria-label="Midnight Lighting"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Orbit vs Guided Scroll Mode */}
      <button
        onClick={onToggleFreeOrbit}
        className={`px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-mono tracking-wider transition-colors cursor-pointer ${
          isFreeOrbit ? 'text-[#050505] bg-[#c8aa6e] font-semibold' : 'text-neutral-300 hover:text-white bg-white/[0.03]'
        }`}
        title="Toggle 360° Free Orbit (drag to inspect)"
      >
        <Compass className="w-3 h-3" />
        <span className="hidden sm:inline">{isFreeOrbit ? 'ORBIT ACTIVE' : '360° ORBIT'}</span>
      </button>

      {/* Reset Camera View */}
      <button
        onClick={onResetView}
        className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        title="Reset Camera Target"
        aria-label="Reset Camera Target"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
