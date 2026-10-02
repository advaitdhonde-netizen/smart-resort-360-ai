import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResortOS } from '../../context/ResortOSContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  X,
  Shield,
  User,
  Lock,
  ArrowLeft,
  Check,
  AlertCircle,
  Building2,
  Briefcase,
  ConciergeBell,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Boxes,
  Users,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface StaffRoleOption {
  role: UserRole;
  label: string;
  badge: string;
  department: string;
  demoEmail: string;
  demoPass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAFF_ROLE_OPTIONS: StaffRoleOption[] = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Administrator',
    badge: 'FULL SYSTEM ACCESS',
    department: 'Executive Governance',
    demoEmail: 'admin@smartresort360.com',
    demoPass: 'admin360!',
    icon: Shield,
  },
  {
    role: 'OWNER',
    label: 'Resort Owner',
    badge: 'EXECUTIVE OVERSIGHT',
    department: 'Ownership & Yield',
    demoEmail: 'owner@smartresort360.com',
    demoPass: 'owner360!',
    icon: Building2,
  },
  {
    role: 'GENERAL_MANAGER',
    label: 'General Manager',
    badge: 'OPERATIONAL COMMAND',
    department: 'Executive Operations',
    demoEmail: 'gm@smartresort360.com',
    demoPass: 'gm360!',
    icon: Briefcase,
  },
  {
    role: 'FRONT_DESK',
    label: 'Front Desk & Concierge',
    badge: 'GUEST RELATIONS',
    department: 'Front Office & Concierge',
    demoEmail: 'frontdesk@smartresort360.com',
    demoPass: 'frontdesk360!',
    icon: ConciergeBell,
  },
  {
    role: 'HOUSEKEEPING',
    label: 'Housekeeping',
    badge: 'ENVIRONMENTAL CARE',
    department: 'Housekeeping & Sanitation',
    demoEmail: 'housekeeping@smartresort360.com',
    demoPass: 'housekeeping360!',
    icon: Sparkles,
  },
  {
    role: 'MAINTENANCE',
    label: 'Maintenance / Engineering',
    badge: 'FACILITIES HEALTH',
    department: 'Engineering & Diagnostics',
    demoEmail: 'maintenance@smartresort360.com',
    demoPass: 'maintenance360!',
    icon: Wrench,
  },
  {
    role: 'RESTAURANT_MANAGER',
    label: 'Restaurant / F&B',
    badge: 'GASTRONOMY',
    department: 'Food & Beverage',
    demoEmail: 'chef@smartresort360.com',
    demoPass: 'chef360!',
    icon: UtensilsCrossed,
  },
  {
    role: 'INVENTORY_MANAGER',
    label: 'Inventory / Supply Chain',
    badge: 'PROCUREMENT',
    department: 'Supply Chain & Warehousing',
    demoEmail: 'inventory@smartresort360.com',
    demoPass: 'inventory360!',
    icon: Boxes,
  },
  {
    role: 'STAFF',
    label: 'Resort Staff',
    badge: 'TASK EXECUTION',
    department: 'Butler Services & Operations',
    demoEmail: 'staff@smartresort360.com',
    demoPass: 'staff360!',
    icon: Users,
  },
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authView,
    closeAuthModal,
    setAuthView,
    login,
    loginAsRole,
  } = useAuth();

  const { openOS, setCurrentRole } = useResortOS();
  const { isLight, toggleTheme } = useTheme();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>('GENERAL_MANAGER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Sync default credentials when switching view or role
  useEffect(() => {
    setError(null);
    setNotice(null);

    if (authView === 'guest') {
      setEmail('guest@smartresort360.com');
      setPassword('guest360!');
    } else if (authView === 'staff') {
      const option = STAFF_ROLE_OPTIONS.find((o) => o.role === selectedStaffRole) || STAFF_ROLE_OPTIONS[0];
      setEmail(option.demoEmail);
      setPassword(option.demoPass);
    }
  }, [authView, selectedStaffRole]);

  if (!isAuthModalOpen) return null;

  const handleStaffRoleSelect = (role: UserRole) => {
    setSelectedStaffRole(role);
    const option = STAFF_ROLE_OPTIONS.find((o) => o.role === role);
    if (option) {
      setEmail(option.demoEmail);
      setPassword(option.demoPass);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, 'CUSTOMER');
    setLoading(false);

    if (res.success) {
      setCurrentRole('CUSTOMER');
      openOS();
    } else {
      setError(res.error || 'Guest authentication failed. Please check credentials.');
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, selectedStaffRole);
    setLoading(false);

    if (res.success) {
      setCurrentRole(selectedStaffRole);
      openOS();
    } else {
      setError(res.error || 'Staff authentication failed. Please check credentials.');
    }
  };

  const handleInstantGuestDemo = async () => {
    setLoading(true);
    const res = await loginAsRole('CUSTOMER');
    setLoading(false);
    if (res.success) {
      setCurrentRole('CUSTOMER');
      openOS();
    }
  };

  const handleForgotPassword = () => {
    setNotice('Demo password reset instruction dispatched to secure channel.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      <div
        className={`relative w-full transition-all duration-300 shadow-2xl overflow-hidden flex flex-col ${
          authView === 'choose'
            ? 'max-w-3xl'
            : authView === 'staff'
            ? 'max-w-2xl'
            : 'max-w-lg'
        } ${
          isLight
            ? 'bg-[#F0EEE7] border border-[#D0CCC0] text-[#26332D]'
            : 'bg-[#090b10] border border-white/10 text-white'
        }`}
      >
        {/* Top Metallic Gold Accent Hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isLight
              ? 'linear-gradient(to right, transparent, #B58A52, transparent)'
              : 'linear-gradient(to right, transparent, #c8aa6e, transparent)',
          }}
        />

        {/* Modal Top Control Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-[#D0CCC0] bg-[#EEECE4]/60' : 'border-white/[0.08] bg-black/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] font-medium ${
                isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
              }`}
            >
              RESORTOS ACCESS GATEWAY
            </span>
            <span className={isLight ? 'text-[#B8AD9B]' : 'text-neutral-600'}>·</span>
            <span
              className={`text-[10px] sm:text-xs font-mono tracking-wider ${
                isLight ? 'text-[#68716B]' : 'text-neutral-400'
              }`}
            >
              SECURE SESSION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 transition-colors cursor-pointer border ${
                isLight
                  ? 'text-[#68716B] hover:text-[#26332D] border-[#D0CCC0] hover:bg-[#E7E4DC]'
                  : 'text-neutral-400 hover:text-white border-white/[0.08] hover:bg-white/[0.05]'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-[#8F6834]" /> : <Sun className="w-4 h-4 text-[#c8aa6e]" />}
            </button>

            <button
              onClick={closeAuthModal}
              className={`p-1.5 transition-colors cursor-pointer border ${
                isLight
                  ? 'text-[#68716B] hover:text-[#26332D] border-[#D0CCC0] hover:bg-[#E7E4DC]'
                  : 'text-neutral-400 hover:text-white border-white/[0.08] hover:bg-white/[0.05]'
              }`}
              aria-label="Close Authentication Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Screen Content */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
          {/* =========================================================================
              VIEW 1: RESORTOS ACCESS (CHOOSE GUEST OR STAFF)
              ========================================================================= */}
          {authView === 'choose' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-2.5 max-w-xl mx-auto">
                <span
                  className={`text-xs font-mono uppercase tracking-[0.3em] font-semibold block ${
                    isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                  }`}
                >
                  RESORTOS ACCESS
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-editorial tracking-wide ${
                    isLight ? 'text-[#18251F]' : 'text-white'
                  }`}
                >
                  How would you like to sign in?
                </h2>
                <p
                  className={`text-xs sm:text-sm font-light leading-relaxed ${
                    isLight ? 'text-[#39453F]' : 'text-neutral-400'
                  }`}
                >
                  Choose the workspace that matches your role. Guests get a simple stay experience, while resort teams get operational tools.
                </p>
              </div>

              {/* Two Large Portal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* CARD 1: FOR GUESTS */}
                <div
                  className={`group relative p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                    isLight
                      ? 'bg-[#EEECE4] hover:bg-[#E7E4DC] border-[#D0CCC0] hover:border-[#8F6834] shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-[#c8aa6e]/60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono uppercase tracking-[0.25em] font-semibold ${
                          isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                        }`}
                      >
                        FOR GUESTS
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                          isLight
                            ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#8F6834] group-hover:border-[#8F6834]'
                            : 'bg-white/[0.04] border-white/10 text-[#c8aa6e] group-hover:border-[#c8aa6e]'
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3
                        className={`text-xl font-editorial font-medium ${
                          isLight ? 'text-[#18251F]' : 'text-white'
                        }`}
                      >
                        Customer Login
                      </h3>
                      <p
                        className={`text-xs font-light leading-relaxed ${
                          isLight ? 'text-[#39453F]' : 'text-neutral-400'
                        }`}
                      >
                        Manage your booking, explore the resort, request support and access your stay.
                      </p>
                    </div>

                    <div
                      className={`text-[11px] font-mono py-2 px-3 border rounded ${
                        isLight
                          ? 'bg-[#E5E2D6] border-[#D0CCC0] text-[#4D5C4D]'
                          : 'bg-white/[0.02] border-white/[0.06] text-neutral-400'
                      }`}
                    >
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Strict Guest Privacy:</span> In-residence suite controls, room service, concierge, and private folio.
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    <button
                      onClick={() => setAuthView('guest')}
                      className={`w-full py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isLight
                          ? 'bg-[#18251F] hover:bg-[#26332D] text-[#EEECE4] shadow-sm'
                          : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] shadow-[0_0_20px_rgba(200,170,110,0.25)]'
                      }`}
                    >
                      <span>Continue as Guest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleInstantGuestDemo}
                      className={`w-full py-1.5 text-[11px] font-mono tracking-wider transition-colors cursor-pointer text-center underline underline-offset-4 ${
                        isLight ? 'text-[#8F6834] hover:text-[#18251F]' : 'text-[#c8aa6e] hover:text-white'
                      }`}
                    >
                      Instant Guest Demo (Villa 12)
                    </button>
                  </div>
                </div>

                {/* CARD 2: FOR RESORT TEAM */}
                <div
                  className={`group relative p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                    isLight
                      ? 'bg-[#EEECE4] hover:bg-[#E7E4DC] border-[#D0CCC0] hover:border-[#8F6834] shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-[#c8aa6e]/60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono uppercase tracking-[0.25em] font-semibold ${
                          isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                        }`}
                      >
                        FOR RESORT TEAM
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                          isLight
                            ? 'bg-[#F0EEE7] border-[#D0CCC0] text-[#8F6834] group-hover:border-[#8F6834]'
                            : 'bg-white/[0.04] border-white/10 text-[#c8aa6e] group-hover:border-[#c8aa6e]'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3
                        className={`text-xl font-editorial font-medium ${
                          isLight ? 'text-[#18251F]' : 'text-white'
                        }`}
                      >
                        Resort Staff Login
                      </h3>
                      <p
                        className={`text-xs font-light leading-relaxed ${
                          isLight ? 'text-[#39453F]' : 'text-neutral-400'
                        }`}
                      >
                        Secure access for Admin, Owner, Manager, Reception, Housekeeping, Maintenance, Restaurant and Inventory teams.
                      </p>
                    </div>

                    <div
                      className={`text-[11px] font-mono py-2 px-3 border rounded ${
                        isLight
                          ? 'bg-[#E5E2D6] border-[#D0CCC0] text-[#4D5C4D]'
                          : 'bg-white/[0.02] border-white/[0.06] text-neutral-400'
                      }`}
                    >
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">Role-Based Operations:</span> Role selection happens during login and governs authorized operational disciplines.
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    <button
                      onClick={() => setAuthView('staff')}
                      className={`w-full py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isLight
                          ? 'bg-[#8F6834] hover:bg-[#785427] text-white shadow-sm'
                          : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15'
                      }`}
                    >
                      <span>Continue to Staff Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div
                      className={`text-[11px] font-mono text-center ${
                        isLight ? 'text-[#68716B]' : 'text-neutral-500'
                      }`}
                    >
                      9 Operational Roles Supported
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: CUSTOMER LOGIN SCREEN
              ========================================================================= */}
          {authView === 'guest' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Back Link */}
              <button
                onClick={() => setAuthView('choose')}
                className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  isLight ? 'text-[#68716B] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose another login</span>
              </button>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <span
                  className={`text-xs font-mono uppercase tracking-[0.25em] font-medium block ${
                    isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                  }`}
                >
                  CUSTOMER ACCESS
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-editorial tracking-wide ${
                    isLight ? 'text-[#18251F]' : 'text-white'
                  }`}
                >
                  Welcome back
                </h2>
                <p
                  className={`text-xs sm:text-sm font-light ${
                    isLight ? 'text-[#39453F]' : 'text-neutral-400'
                  }`}
                >
                  Sign in to manage your stay.
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {notice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Guest Login Form */}
              <form onSubmit={handleGuestSubmit} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className={`block font-medium ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@smartresort360.com"
                    className={`w-full p-2.5 text-xs font-mono focus:outline-none transition-colors border ${
                      isLight
                        ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                        : 'bg-white/[0.03] border-white/10 text-white focus:border-[#c8aa6e]/60'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block font-medium ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter passkey (e.g. guest360!)"
                      className={`w-full p-2.5 pr-10 text-xs font-mono focus:outline-none transition-colors border ${
                        isLight
                          ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                          : 'bg-white/[0.03] border-white/10 text-white focus:border-[#c8aa6e]/60'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                        isLight ? 'text-[#68716B] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Options: Remember me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-[#8F6834] dark:accent-[#c8aa6e]"
                    />
                    <span className={isLight ? 'text-[#39453F]' : 'text-neutral-400'}>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={`transition-colors cursor-pointer underline underline-offset-4 ${
                      isLight ? 'text-[#8F6834] hover:text-[#18251F]' : 'text-[#c8aa6e] hover:text-white'
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isLight
                      ? 'bg-[#18251F] hover:bg-[#26332D] text-[#EEECE4] shadow-sm'
                      : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] shadow-[0_0_20px_rgba(200,170,110,0.25)]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Authenticating Guest...' : 'Sign In'}</span>
                </button>
              </form>

              {/* Demo Hint & Alternative Actions */}
              <div
                className={`pt-4 border-t space-y-3 text-xs font-mono ${
                  isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
                }`}
              >
                <div
                  className={`p-3 border rounded text-[11px] flex items-center justify-between gap-3 ${
                    isLight
                      ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#39453F]'
                      : 'bg-white/[0.02] border-white/[0.08] text-neutral-300'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Demo Account:</span>{' '}
                    guest@smartresort360.com / guest360!
                  </div>
                  <button
                    onClick={handleInstantGuestDemo}
                    className={`shrink-0 px-2.5 py-1 text-[10px] uppercase font-semibold border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-[#F0EEE7] border-[#8F6834] text-[#8F6834] hover:bg-[#8F6834] hover:text-white'
                        : 'bg-white/[0.04] border-[#c8aa6e]/50 text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-black'
                    }`}
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="text-center">
                  <span className={isLight ? 'text-[#68716B]' : 'text-neutral-500'}>
                    Don&apos;t have an account?{' '}
                  </span>
                  <button
                    onClick={() => {
                      setNotice('Guest registration demo: Pre-authorized for Villa 12.');
                      setEmail('guest@smartresort360.com');
                      setPassword('guest360!');
                    }}
                    className={`underline underline-offset-4 cursor-pointer font-medium ${
                      isLight ? 'text-[#8F6834] hover:text-[#18251F]' : 'text-[#c8aa6e] hover:text-white'
                    }`}
                  >
                    Create one
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: RESORT STAFF LOGIN SCREEN
              ========================================================================= */}
          {authView === 'staff' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Back Link */}
              <button
                onClick={() => setAuthView('choose')}
                className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  isLight ? 'text-[#68716B] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose another login</span>
              </button>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <span
                  className={`text-xs font-mono uppercase tracking-[0.25em] font-medium block ${
                    isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                  }`}
                >
                  STAFF WORKSPACE
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-editorial tracking-wide ${
                    isLight ? 'text-[#18251F]' : 'text-white'
                  }`}
                >
                  Sign in to your workspace
                </h2>
                <p
                  className={`text-xs sm:text-sm font-light ${
                    isLight ? 'text-[#39453F]' : 'text-neutral-400'
                  }`}
                >
                  Select your resort role and sign in securely.
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {notice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Role Selection Grid (9 Operational Roles) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-semibold ${isLight ? 'text-[#18251F]' : 'text-white'}`}>
                    Select Resort Role:
                  </span>
                  <span
                    className={`text-[11px] ${
                      isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                    }`}
                  >
                    Stored in authenticated session
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STAFF_ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedStaffRole === opt.role;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => handleStaffRoleSelect(opt.role)}
                        className={`p-2.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? isLight
                              ? 'bg-[#E7E4DC] border-[#8F6834] shadow-sm'
                              : 'bg-white/[0.08] border-[#c8aa6e] shadow-[0_0_12px_rgba(200,170,110,0.15)]'
                            : isLight
                            ? 'bg-[#EEECE4] border-[#D0CCC0] hover:bg-[#E7E4DC] hover:border-[#B8AD9B]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isSelected
                                ? isLight
                                  ? 'text-[#8F6834]'
                                  : 'text-[#c8aa6e]'
                                : isLight
                                ? 'text-[#68716B]'
                                : 'text-neutral-400'
                            }`}
                          />
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                isLight ? 'text-[#8F6834]' : 'text-[#c8aa6e]'
                              }`}
                            />
                          )}
                        </div>

                        <div className="mt-2 space-y-0.5">
                          <div
                            className={`text-xs font-medium truncate ${
                              isSelected
                                ? isLight
                                  ? 'text-[#18251F] font-semibold'
                                  : 'text-white font-semibold'
                                : isLight
                                ? 'text-[#26332D]'
                                : 'text-neutral-300'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <div
                            className={`text-[9px] font-mono uppercase tracking-wider truncate ${
                              isLight ? 'text-[#68716B]' : 'text-neutral-500'
                            }`}
                          >
                            {opt.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff Login Form */}
              <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs font-mono pt-2">
                <div className="space-y-1.5">
                  <label className={`block font-medium ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                    Staff Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. gm@smartresort360.com"
                    className={`w-full p-2.5 text-xs font-mono focus:outline-none transition-colors border ${
                      isLight
                        ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                        : 'bg-white/[0.03] border-white/10 text-white focus:border-[#c8aa6e]/60'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block font-medium ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
                    Security Passkey
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter cryptographic passkey"
                      className={`w-full p-2.5 pr-10 text-xs font-mono focus:outline-none transition-colors border ${
                        isLight
                          ? 'bg-[#EEECE4] border-[#D0CCC0] text-[#18251F] focus:border-[#8F6834]'
                          : 'bg-white/[0.03] border-white/10 text-white focus:border-[#c8aa6e]/60'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                        isLight ? 'text-[#68716B] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Options: Remember me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-[#8F6834] dark:accent-[#c8aa6e]"
                    />
                    <span className={isLight ? 'text-[#39453F]' : 'text-neutral-400'}>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={`transition-colors cursor-pointer underline underline-offset-4 ${
                      isLight ? 'text-[#8F6834] hover:text-[#18251F]' : 'text-[#c8aa6e] hover:text-white'
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isLight
                      ? 'bg-[#18251F] hover:bg-[#26332D] text-[#EEECE4] shadow-sm'
                      : 'bg-[#c8aa6e] hover:bg-[#d8bc7f] text-[#050505] shadow-[0_0_20px_rgba(200,170,110,0.25)]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {loading
                      ? 'Authorizing Session...'
                      : `Sign In as ${STAFF_ROLE_OPTIONS.find((o) => o.role === selectedStaffRole)?.label}`}
                  </span>
                </button>
              </form>

              {/* Bottom Navigation Link */}
              <div
                className={`pt-3 border-t text-center ${
                  isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
                }`}
              >
                <button
                  onClick={() => setAuthView('choose')}
                  className={`text-xs font-mono uppercase tracking-wider underline underline-offset-4 cursor-pointer transition-colors ${
                    isLight ? 'text-[#68716B] hover:text-[#18251F]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Choose another login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
