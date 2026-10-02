import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResortOSProvider, useResortOS } from './context/ResortOSContext';
import { Navigation } from './components/Navigation';
import { ResortScene } from './components/canvas/ResortScene';
import { HeroSection } from './components/sections/HeroSection';
import { DigitalTwinSection } from './components/sections/DigitalTwinSection';
import { IntelligenceSection } from './components/sections/IntelligenceSection';
import { OperatingSystemSection } from './components/sections/OperatingSystemSection';
import { FinalSection } from './components/sections/FinalSection';
import { SceneControls } from './components/ui/SceneControls';
import { ResortOSModal } from './components/operating-system/ResortOSModal';
import { AuthModal } from './components/auth/AuthModal';
import { LightingMode, ZoneId } from './types';

function AppContent({
  lightingMode,
  setLightingMode,
  activeZone,
  handleSelectZone,
  handleResetView,
  isFreeOrbit,
  setIsFreeOrbit,
  scrollProgressRef,
  activeSection,
}: {
  lightingMode: LightingMode;
  setLightingMode: (m: LightingMode) => void;
  activeZone: ZoneId | null;
  handleSelectZone: (zone: ZoneId) => void;
  handleResetView: () => void;
  isFreeOrbit: boolean;
  setIsFreeOrbit: React.Dispatch<React.SetStateAction<boolean>>;
  scrollProgressRef: React.MutableRefObject<number>;
  activeSection: string;
}) {
  const { openOS } = useResortOS();
  const { isLight } = useTheme();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleLaunch = () => {
    if (!isAuthenticated) {
      openAuthModal('choose');
    } else {
      openOS();
    }
  };

  const scrollToExplore = () => {
    const twinSection = document.getElementById('digital-twin');
    if (twinSection) {
      twinSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative min-h-screen ${isLight ? 'bg-[#E5E2D6] text-[#26332D] selection:bg-[#B58A52]/30 selection:text-[#26332D]' : 'bg-[#050505] text-[#EDEDED] selection:bg-[#c8aa6e]/30 selection:text-white'}`}>
      {/* 3D Fixed Canvas Background (Digital Twin) */}
      <ResortScene
        lightingMode={lightingMode}
        activeZone={activeZone}
        onSelectZone={handleSelectZone}
        scrollProgressRef={scrollProgressRef}
        isFreeOrbit={isFreeOrbit}
      />

      {/* Subtle vignette overlay tailored for current theme */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(229, 226, 214, 0.3) 55%, rgba(229, 226, 214, 0.85) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 5, 0.4) 55%, rgba(5, 5, 5, 0.85) 100%)',
        }}
        aria-hidden="true" 
      />

      {/* Top Navigation */}
      <Navigation
        onLaunchOS={handleLaunch}
        activeSection={activeSection}
      />

      {/* Main Scroll Content (Approximates 500vh of cinematic narrative) */}
      <main className="relative z-10">
        {/* Hero Viewport */}
        <HeroSection
          onExplore={scrollToExplore}
          onToggleFreeOrbit={() => setIsFreeOrbit((prev) => !prev)}
          isFreeOrbit={isFreeOrbit}
        />

        {/* Section 01: Digital Twin */}
        <DigitalTwinSection
          activeZone={activeZone}
          onSelectZone={handleSelectZone}
        />

        {/* Section 02: Intelligence */}
        <IntelligenceSection
          onSelectZone={handleSelectZone}
        />

        {/* Section 03: One Operating System (12 Disciplines) */}
        <OperatingSystemSection
          onSelectZone={handleSelectZone}
        />

        {/* Final Section */}
        <FinalSection
          onEnter={handleLaunch}
        />
      </main>

      {/* Floating Scene Controls HUD */}
      <SceneControls
        lightingMode={lightingMode}
        onChangeLighting={setLightingMode}
        isFreeOrbit={isFreeOrbit}
        onToggleFreeOrbit={() => setIsFreeOrbit((prev) => !prev)}
        onResetView={handleResetView}
      />

      {/* Real Full Resort Management Operating System Modal (RBAC-aware) */}
      <ResortOSModal />

      {/* Secure Cryptographic Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  const [lightingMode, setLightingMode] = useState<LightingMode>('twilight');
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [isFreeOrbit, setIsFreeOrbit] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const scrollProgressRef = useRef<number>(0);

  // High performance scroll listener using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        scrollProgressRef.current = Math.max(0, Math.min(1, window.scrollY / scrollHeight));
      }

      // Check current visible section
      const scrollY = window.scrollY;
      const winHeight = window.innerHeight;
      
      const twinEl = document.getElementById('digital-twin');
      const intelEl = document.getElementById('intelligence');
      const opsEl = document.getElementById('operations');

      if (opsEl && scrollY >= opsEl.offsetTop - winHeight * 0.4) {
        setActiveSection('operations');
      } else if (intelEl && scrollY >= intelEl.offsetTop - winHeight * 0.4) {
        setActiveSection('intelligence');
      } else if (twinEl && scrollY >= twinEl.offsetTop - winHeight * 0.4) {
        setActiveSection('digital-twin');
      } else {
        setActiveSection('hero');
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSelectZone = (zone: ZoneId) => {
    setActiveZone(zone);
    if (isFreeOrbit) {
      setIsFreeOrbit(false);
    }
  };

  const handleResetView = () => {
    setActiveZone(null);
    setIsFreeOrbit(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ResortOSProvider onLocate3DZone={handleSelectZone}>
          <AppContent
            lightingMode={lightingMode}
            setLightingMode={setLightingMode}
            activeZone={activeZone}
            handleSelectZone={handleSelectZone}
            handleResetView={handleResetView}
            isFreeOrbit={isFreeOrbit}
            setIsFreeOrbit={setIsFreeOrbit}
            scrollProgressRef={scrollProgressRef}
            activeSection={activeSection}
          />
        </ResortOSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
