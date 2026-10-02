import React, { useState } from 'react';
import { useResortOS } from '../../context/ResortOSContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS, OPERATIONAL_AREAS } from '../../data/resortData';
import { UserRole, OperationalAreaId } from '../../types';
import {
  X,
  Shield,
  Layers,
  Calendar,
  BedDouble,
  Users,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Package,
  Receipt,
  Star,
  BarChart3,
  Lock,
  UserCheck,
  User,
  LogOut,
  LogIn,
  AlertOctagon,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CustomerPortal } from './CustomerPortal';
import { ReservationsModule } from './modules/ReservationsModule';
import { RoomsModule } from './modules/RoomsModule';
import { GuestsModule } from './modules/GuestsModule';
import { HousekeepingModule } from './modules/HousekeepingModule';
import { MaintenanceModule } from './modules/MaintenanceModule';
import { RestaurantModule } from './modules/RestaurantModule';
import { InventoryModule } from './modules/InventoryModule';
import { StaffModule } from './modules/StaffModule';
import { PaymentsModule } from './modules/PaymentsModule';
import { FeedbackModule } from './modules/FeedbackModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { AuditModule } from './modules/AuditModule';
import { AICopilotModal } from '../ai/AICopilotModal';
import { IssueAgentModal } from '../ai/IssueAgentModal';

const MODULE_ICONS: Record<OperationalAreaId, React.ComponentType<{ className?: string }>> = {
  reservations: Calendar,
  rooms: BedDouble,
  guests: Users,
  housekeeping: Sparkles,
  maintenance: Wrench,
  restaurant: UtensilsCrossed,
  inventory: Package,
  staff: UserCheck,
  payments: Receipt,
  feedback: Star,
  analytics: BarChart3,
  audit: Lock,
};

export const ResortOSModal: React.FC = () => {
  const {
    isOSOpen,
    closeOS,
    currentRole,
    setCurrentRole,
    activeModule,
    setActiveModule,
    allowedModules,
  } = useResortOS();

  const {
    user,
    isAuthenticated,
    isCustomer,
    canAccessModule,
    openAuthModal,
    logout,
  } = useAuth();

  const { isLight, toggleTheme } = useTheme();

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isIssueAgentOpen, setIsIssueAgentOpen] = useState(false);

  if (!isOSOpen) return null;

  // Route guard: Prompt user to authenticate if attempting to access OS unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
        <div
          className={`p-8 max-w-md w-full border text-center space-y-4 shadow-2xl ${
            isLight ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#26332D]' : 'bg-[#090b10] border-white/10 text-white'
          }`}
        >
          <Shield className={`w-10 h-10 mx-auto ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
          <h3 className="text-xl font-editorial">Authentication Required</h3>
          <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-[#39453F]' : 'text-neutral-400'}`}>
            Access to the Smart Resort 360 kernel requires an active authenticated session. Please choose your role and sign in securely.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                closeOS();
                openAuthModal('choose');
              }}
              className={`px-6 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                isLight
                  ? 'bg-[#18251F] text-[#EEECE4] hover:bg-[#26332D]'
                  : 'bg-[#c8aa6e] text-[#050505] hover:bg-[#d8bc7f]'
              }`}
            >
              Sign In to ResortOS
            </button>
            <button
              onClick={closeOS}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider cursor-pointer border transition-colors ${
                isLight
                  ? 'border-[#D0CCC0] text-[#39453F] hover:bg-[#E7E4DC]'
                  : 'border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveRole: UserRole = user ? user.role : currentRole;
  const currentRoleConfig = ROLE_CONFIGS.find((r) => r.role === effectiveRole) || ROLE_CONFIGS[0];

  const handleSignOut = () => {
    logout();
    closeOS();
    openAuthModal('choose');
  };

  const renderActiveModule = () => {
    // Route guard: Customers can NEVER view staff screens
    if (isCustomer) {
      return (
        <div className="p-8 bg-red-500/10 border border-red-500/30 text-center space-y-3">
          <AlertOctagon className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-editorial text-white">403 FORBIDDEN: ACCESS BLOCKED</h3>
          <p className="text-xs font-mono text-neutral-300 max-w-lg mx-auto">
            Guest accounts are cryptographically partitioned from staff administration, internal analytics, employee rosters, and facility diagnostics.
          </p>
        </div>
      );
    }

    if (!canAccessModule(activeModule)) {
      return (
        <div className="p-8 bg-white/[0.02] border border-white/10 text-center space-y-3">
          <Shield className="w-8 h-8 text-[#c8aa6e] mx-auto" />
          <h3 className="text-lg font-editorial text-white">Permission Restricted</h3>
          <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
            Your assigned role ({currentRoleConfig.label}) is not authorized to access this operational discipline.
          </p>
        </div>
      );
    }

    switch (activeModule) {
      case 'reservations':
        return <ReservationsModule />;
      case 'rooms':
        return <RoomsModule />;
      case 'guests':
        return <GuestsModule />;
      case 'housekeeping':
        return <HousekeepingModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'restaurant':
        return <RestaurantModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'staff':
        return <StaffModule />;
      case 'payments':
        return <PaymentsModule />;
      case 'feedback':
        return <FeedbackModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'audit':
        return <AuditModule />;
      default:
        return <ReservationsModule />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-[#050505]/95 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-7xl h-[94vh] bg-[#08090d] border border-white/[0.1] shadow-[0_0_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Top Metallic Champagne Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent" />

        {/* Master Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-8 sm:py-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-editorial text-sm sm:text-base tracking-[0.2em] uppercase text-white font-semibold">
                SMART RESORT 360
              </span>
              <span className="text-neutral-600 font-mono">/</span>
              <span className="text-xs font-mono text-[#c8aa6e] tracking-wider uppercase">
                {isCustomer ? 'GUEST PORTAL' : 'STAFF OPERATIONS OS'}
              </span>
            </div>
          </div>

          {/* Authenticated Identity Indicator & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Small Read-Only Identity Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono ${
                isLight
                  ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F]'
                  : 'bg-white/[0.04] border-white/10 text-white'
              }`}
              title="Authenticated Session Role (Configured at Login)"
            >
              {isCustomer ? (
                <User className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              ) : (
                <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'}`} />
              )}
              <span className="font-semibold tracking-wider text-[11px]">
                {currentRoleConfig.label.toUpperCase()}
              </span>
            </div>

            {!isCustomer && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#c8aa6e] bg-[#c8aa6e]/10 hover:bg-[#c8aa6e]/20 border border-[#c8aa6e]/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(200,170,110,0.15)]"
                  title="Open AI Resort Copilot & Operations Briefing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c8aa6e]" />
                  <span>AI Copilot</span>
                </button>
                <button
                  onClick={() => setIsIssueAgentOpen(true)}
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Report facility issue with AI vision triage"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Issue Agent</span>
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              aria-label={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-[#B58A52]" /> : <Sun className="w-3.5 h-3.5 text-[#c8aa6e]" />}
              <span className="hidden md:inline text-[10px] tracking-wider">{isLight ? 'DARK' : 'LIGHT'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                isLight
                  ? 'text-[#39453F] hover:text-[#18251F] bg-[#EEECE4] hover:bg-[#E7E4DC] border-[#D0CCC0]'
                  : 'text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
              }`}
              title="Sign out of authenticated session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={closeOS}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.08] hover:border-white/20"
              aria-label="Close Operating System"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role & Authenticated User Banner */}
        <div className="px-6 sm:px-8 py-2.5 bg-white/[0.015] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-3 truncate">
            <span className="text-white font-medium">{user ? user.fullName : 'Guest'}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-[#c8aa6e] font-medium">{currentRoleConfig.badge}</span>
            <span className="text-neutral-600 hidden md:inline">·</span>
            <span className="font-light text-neutral-300 truncate max-w-xl hidden md:inline">
              {currentRoleConfig.description}
            </span>
          </div>
          <span className="hidden md:inline text-[11px] text-neutral-500 shrink-0">
            {isCustomer ? 'GUEST STAY ACTIVE' : `${currentRoleConfig.allowedModules.length} OF 12 MODULES AUTHORIZED`}
          </span>
        </div>

        {/* Main Content Body: Distinct Experiences */}
        {isCustomer ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <CustomerPortal />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Authorized Modules Only */}
            <aside className="w-64 border-r border-white/[0.08] bg-[#07080b]/80 p-4 space-y-1.5 overflow-y-auto hidden md:block shrink-0">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 px-3 py-2">
                AUTHORIZED ENGINES
              </div>

              {OPERATIONAL_AREAS.filter((mod) => currentRoleConfig.allowedModules.includes(mod.id)).map((mod) => {
                const Icon = MODULE_ICONS[mod.id] || Layers;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs font-mono tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.08] border-l-2 border-[#c8aa6e] text-white font-medium pl-3.5 shadow-[0_0_15px_rgba(200,170,110,0.1)]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#c8aa6e]' : 'text-neutral-500'}`} />
                      <span className="truncate">{mod.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 tabular-nums">{mod.index}</span>
                  </button>
                );
              })}

              {/* Cognitive Layer Section in Sidebar */}
              <div className="pt-4 mt-2 border-t border-white/[0.08] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 px-3">
                  COGNITIVE LAYER
                </div>
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full text-left p-3 bg-gradient-to-r from-[#c8aa6e]/10 to-transparent border border-[#c8aa6e]/30 hover:border-[#c8aa6e]/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#c8aa6e] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono font-medium text-white">AI Resort Copilot</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    Live telemetry, briefings, anomalies & actions
                  </p>
                </button>
                <button
                  onClick={() => setIsIssueAgentOpen(true)}
                  className="w-full text-left p-2.5 bg-white/[0.02] border border-white/[0.08] hover:border-amber-400/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Issue Agent (Vision)</span>
                  </div>
                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    Multimodal triage & auto-dispatch
                  </p>
                </button>
              </div>
            </aside>

            {/* Mobile Module Navigation Dropdown */}
            <div className="md:hidden p-3 border-b border-white/[0.08] bg-black/60 w-full shrink-0 flex flex-col gap-2">
              <select
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value as OperationalAreaId)}
                className="w-full p-2 bg-[#0e1118] border border-white/10 text-white font-mono text-xs"
              >
                {OPERATIONAL_AREAS.filter((mod) => currentRoleConfig.allowedModules.includes(mod.id)).map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.index}. {mod.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="flex-1 py-1.5 px-2 bg-[#c8aa6e]/10 border border-[#c8aa6e]/40 text-[#c8aa6e] text-[11px] font-mono uppercase text-center"
                >
                  AI Copilot
                </button>
                <button
                  onClick={() => setIsIssueAgentOpen(true)}
                  className="flex-1 py-1.5 px-2 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px] font-mono uppercase text-center"
                >
                  Issue Agent
                </button>
              </div>
            </div>

            {/* Active Module Execution Pane */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8">
              {renderActiveModule()}
            </main>
          </div>
        )}

        {/* Global OS Status Footer */}
        <div className="px-6 sm:px-8 py-3 bg-black/50 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white">OS RUNTIME KERNEL v4.2 ONLINE</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <span className="hidden sm:inline text-neutral-500">HARDWARE ENCLAVE VERIFIED</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#c8aa6e]">{effectiveRole} SESSION</span>
            <button
              onClick={closeOS}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Exit to Twin View
            </button>
          </div>
        </div>
      </div>

      {/* AI Resort Copilot & Operations Briefing Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        userRole={effectiveRole}
      />

      {/* AI Issue Agent Modal */}
      <IssueAgentModal
        isOpen={isIssueAgentOpen}
        onClose={() => setIsIssueAgentOpen(false)}
        defaultLocation="Room 201"
        reportedBy={`${user ? user.fullName : 'Staff'} (${effectiveRole})`}
      />
    </div>
  );
};
