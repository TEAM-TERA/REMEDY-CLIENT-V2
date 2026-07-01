/**
 * Auth/session state (Zustand) backed by REMEDY-BACK-V3.
 *  - real email register/login (services/auth) with the JWT in expo-secure-store
 *  - restoreSession() on app start: load token → GET /users → set the session
 *  - the email isn't returned by GET /users, so we keep what was entered at login
 */
import { create } from 'zustand';
import { loadToken, setToken } from '@/services/api';
import { login as apiLogin, logout as apiLogout, register as apiRegister, type RegisterInput } from '@/services/auth';
import { getProfile, type Profile } from '@/services/backend';

export interface SessionUser {
  username: string;
  email: string;
  profileImageUrl?: string | null;
  gender?: boolean | null;
  birthDate?: string | null;
}

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** true until restoreSession() finishes (gates the initial route) */
  restoring: boolean;

  restoreSession: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  applyProfile: (p: Profile) => void;
}

function toUser(p: Profile, email: string): SessionUser {
  return { username: p.username, email, profileImageUrl: p.profileImageUrl, gender: p.gender, birthDate: p.birthDate };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  restoring: true,

  restoreSession: async () => {
    try {
      const token = await loadToken();
      if (!token) {
        set({ restoring: false, isAuthenticated: false, user: null });
        return;
      }
      const profile = await getProfile();
      set({ user: toUser(profile, get().user?.email ?? ''), isAuthenticated: true, restoring: false });
    } catch {
      // token invalid/expired or backend unreachable → drop to login
      await setToken(null);
      set({ restoring: false, isAuthenticated: false, user: null });
    }
  },

  register: async (input) => {
    await apiRegister(input);
  },

  signIn: async (email, password) => {
    await apiLogin(email, password);
    const profile = await getProfile();
    set({ user: toUser(profile, email), isAuthenticated: true });
  },

  signOut: async () => {
    await apiLogout();
    set({ user: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    const profile = await getProfile();
    set((s) => ({ user: s.user ? { ...s.user, ...toUser(profile, s.user.email) } : toUser(profile, '') }));
  },

  applyProfile: (p) =>
    set((s) => ({ user: s.user ? { ...s.user, username: p.username, gender: p.gender, birthDate: p.birthDate } : s.user })),
}));
