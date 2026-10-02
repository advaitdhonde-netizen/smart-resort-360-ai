import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, OperationalAreaId } from '../types';
import { ROLE_CONFIGS } from '../data/resortData';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  vipTier?: string;
  assignedRoom?: string;
  department?: string;
  token: string;
}

export type AuthFlowView = 'choose' | 'guest' | 'staff';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isStaff: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => Promise<{ success: boolean; user: AuthUser }>;
  logout: () => void;
  switchRolePersona: (role: UserRole) => void;
  canAccessModule: (moduleId: OperationalAreaId) => boolean;
  isAuthModalOpen: boolean;
  authView: AuthFlowView;
  openAuthModal: (view?: AuthFlowView) => void;
  closeAuthModal: () => void;
  setAuthView: (view: AuthFlowView) => void;
  // Backwards compatibility aliases
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

// Pre-seeded user accounts for clean demo authentication
export const SEED_ACCOUNTS: Array<AuthUser & { passwordHash: string; plainHint: string }> = [
  {
    id: 'usr-guest',
    email: 'guest@smartresort360.com',
    fullName: 'Lord Alexander Harrington',
    role: 'CUSTOMER',
    vipTier: 'Tier 1 Titanium',
    assignedRoom: 'Villa 12',
    token: 'jwt_guest_harrington_token_valid',
    passwordHash: 'guest360!',
    plainHint: 'guest360!',
  },
  {
    id: 'usr-admin',
    email: 'admin@smartresort360.com',
    fullName: 'Marcus Sterling',
    role: 'SUPER_ADMIN',
    department: 'Executive Governance',
    token: 'jwt_super_admin_token_valid',
    passwordHash: 'admin360!',
    plainHint: 'admin360!',
  },
  {
    id: 'usr-owner',
    email: 'owner@smartresort360.com',
    fullName: 'Maximilian von Bern',
    role: 'OWNER',
    department: 'Ownership & Strategic Yield',
    token: 'jwt_owner_token_valid',
    passwordHash: 'owner360!',
    plainHint: 'owner360!',
  },
  {
    id: 'usr-gm',
    email: 'gm@smartresort360.com',
    fullName: 'Claire Delacroix',
    role: 'GENERAL_MANAGER',
    department: 'Executive Command',
    token: 'jwt_gm_token_valid',
    passwordHash: 'gm360!',
    plainHint: 'gm360!',
  },
  {
    id: 'usr-frontdesk',
    email: 'frontdesk@smartresort360.com',
    fullName: 'Julian Thorne',
    role: 'FRONT_DESK',
    department: 'Front Office & Concierge',
    token: 'jwt_frontdesk_token_valid',
    passwordHash: 'frontdesk360!',
    plainHint: 'frontdesk360!',
  },
  {
    id: 'usr-housekeeping',
    email: 'housekeeping@smartresort360.com',
    fullName: 'Elena Santos',
    role: 'HOUSEKEEPING',
    department: 'Environmental Care & Sanitation',
    token: 'jwt_housekeeping_token_valid',
    passwordHash: 'housekeeping360!',
    plainHint: 'housekeeping360!',
  },
  {
    id: 'usr-maintenance',
    email: 'maintenance@smartresort360.com',
    fullName: 'Victor Hansen',
    role: 'MAINTENANCE',
    department: 'Engineering & Facilities',
    token: 'jwt_maintenance_token_valid',
    passwordHash: 'maintenance360!',
    plainHint: 'maintenance360!',
  },
  {
    id: 'usr-chef',
    email: 'chef@smartresort360.com',
    fullName: 'Laurent Dufour',
    role: 'RESTAURANT_MANAGER',
    department: 'Food & Beverage',
    token: 'jwt_chef_token_valid',
    passwordHash: 'chef360!',
    plainHint: 'chef360!',
  },
  {
    id: 'usr-inventory',
    email: 'inventory@smartresort360.com',
    fullName: 'Sophie Chen',
    role: 'INVENTORY_MANAGER',
    department: 'Supply Chain & Procurement',
    token: 'jwt_inventory_token_valid',
    passwordHash: 'inventory360!',
    plainHint: 'inventory360!',
  },
  {
    id: 'usr-staff',
    email: 'staff@smartresort360.com',
    fullName: 'Mei Lin',
    role: 'STAFF',
    department: 'Butler Services & Duty Operations',
    token: 'jwt_staff_token_valid',
    passwordHash: 'staff360!',
    plainHint: 'staff360!',
  },
];

const AUTH_STORAGE_KEY = 'smart_resort_360_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session initializes from storage or starts unauthenticated to present the login flow
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) {
            return parsed;
          }
        }
      } catch {
        // Fallback to unauthenticated
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthFlowView>('choose');

  const isAuthenticated = !!user;
  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = isAuthenticated && !isCustomer;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [user]);

  const login = async (
    email: string,
    password: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Look up in seeded accounts
    let found = SEED_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === trimmedEmail
    );

    // If roleOverride specified and no direct email found, find account for that role
    if (!found && roleOverride) {
      found = SEED_ACCOUNTS.find((acc) => acc.role === roleOverride);
    }

    if (!found) {
      return {
        success: false,
        error: 'No active account found for this email address. Please check your credentials.',
      };
    }

    // For demo convenience, allow the seed passkey or general passkey 'resort360!'
    const isPassValid =
      password === found.passwordHash ||
      password === 'resort360!' ||
      password === 'admin360!' ||
      password === 'guest360!';

    if (!isPassValid) {
      return {
        success: false,
        error: `Invalid passkey. For demo testing, use: ${found.plainHint}`,
      };
    }

    const authUser: AuthUser = {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: roleOverride || found.role,
      vipTier: found.vipTier,
      assignedRoom: found.assignedRoom,
      department: found.department,
      token: found.token,
    };

    setUser(authUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginAsRole = async (role: UserRole): Promise<{ success: boolean; user: AuthUser }> => {
    const account = SEED_ACCOUNTS.find((acc) => acc.role === role) || SEED_ACCOUNTS[0];
    const authUser: AuthUser = {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      vipTier: account.vipTier,
      assignedRoom: account.assignedRoom,
      department: account.department,
      token: account.token,
    };
    setUser(authUser);
    setIsAuthModalOpen(false);
    return { success: true, user: authUser };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const switchRolePersona = (role: UserRole) => {
    const account = SEED_ACCOUNTS.find((acc) => acc.role === role);
    if (account) {
      setUser({
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        vipTier: account.vipTier,
        assignedRoom: account.assignedRoom,
        department: account.department,
        token: account.token,
      });
    }
  };

  const canAccessModule = (moduleId: OperationalAreaId): boolean => {
    if (!user) return false;
    // Strict isolation: Customers can NEVER access staff modules!
    if (user.role === 'CUSTOMER') return false;

    const roleConfig = ROLE_CONFIGS.find((r) => r.role === user.role);
    if (!roleConfig) return false;

    return roleConfig.allowedModules.includes(moduleId);
  };

  const openAuthModal = (view: AuthFlowView = 'choose') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isCustomer,
        isStaff,
        login,
        loginAsRole,
        logout,
        switchRolePersona,
        canAccessModule,
        isAuthModalOpen,
        authView,
        openAuthModal,
        closeAuthModal,
        setAuthView,
        // Compatibility aliases
        isLoginModalOpen: isAuthModalOpen,
        openLoginModal: () => openAuthModal('choose'),
        closeLoginModal: closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

