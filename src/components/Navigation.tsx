import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, User, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  onLaunchOS: () => void;
  activeSection: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onLaunchOS, activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, isCustomer, isAuthenticated, openAuthModal } = useAuth();
  const { toggleTheme, isLight } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050505]/85 backdrop-blur-md border-b border-white/[0.07] py-4'
          : 'bg-gradient-to-b from-[#050505]/80 to-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-left group cursor-pointer focus-visible:outline-none"
        >
          <span className="text-sm md:text-base font-semibold tracking-[0.22em] text-[#EDEDED] uppercase font-editorial group-hover:text-[#c8aa6e] transition-colors">
            SMART RESORT 360
          </span>
        </button>

        {/* Zone 2: 3-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs tracking-[0.18em] font-medium uppercase text-neutral-400">
          <button
            onClick={() => scrollToSection('digital-twin')}
            className={`transition-colors hover:text-[#EDEDED] py-1 cursor-pointer focus-visible:outline-none ${
              activeSection === 'digital-twin' ? 'text-[#c8aa6e]' : ''
            }`}
          >
            DIGITAL TWIN
          </button>
          <button
            onClick={() => scrollToSection('intelligence')}
            className={`transition-colors hover:text-[#EDEDED] py-1 cursor-pointer focus-visible:outline-none ${
              activeSection === 'intelligence' ? 'text-[#c8aa6e]' : ''
            }`}
          >
            INTELLIGENCE
          </button>
          <button
            onClick={() => scrollToSection('operations')}
            className={`transition-colors hover:text-[#EDEDED] py-1 cursor-pointer focus-visible:outline-none ${
              activeSection === 'operations' ? 'text-[#c8aa6e]' : ''
            }`}
          >
            OPERATIONS
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle: Switches between DARK and LIGHT */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
            title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {isLight ? (
              <Moon className="w-3.5 h-3.5 text-[#B58A52]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#c8aa6e]" />
            )}
            <span className="hidden sm:inline text-[11px] font-mono tracking-widest text-neutral-400">
              {isLight ? 'DARK' : 'LIGHT'}
            </span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('choose');
              } else {
                onLaunchOS();
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title={isAuthenticated ? 'Open Authenticated Workspace' : 'Sign in to ResortOS'}
          >
            {isCustomer ? (
              <User className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
            ) : (
              <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
            )}
            <span className="truncate max-w-[130px]">
              {user ? user.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          <button
            onClick={onLaunchOS}
            className="px-4 md:px-5 py-2 text-xs tracking-[0.16em] uppercase font-medium text-[#050505] bg-[#c8aa6e] hover:bg-[#d8bc7f] transition-all duration-200 cursor-pointer shadow-[0_0_24px_rgba(200,170,110,0.25)] hover:shadow-[0_0_32px_rgba(200,170,110,0.45)] whitespace-nowrap"
          >
            {isCustomer ? 'GUEST PORTAL' : 'LAUNCH OS'}
          </button>
        </div>

      </div>
    </header>
  );
};
