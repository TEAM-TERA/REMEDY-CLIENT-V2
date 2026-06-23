/**
 * Auth/session state (Zustand). M1 uses a mock sign-in (login screen just
 * sets a fake session). M3 replaces `signIn` with the real Spotify PKCE flow
 * (see src/services/spotify.ts) and persists tokens to expo-secure-store.
 */
import { create } from 'zustand';
import type { ServiceId, User } from '@/types';
import { ME } from '@/data/mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** mock sign-in for M1; replaced by real OAuth in M3 */
  signInMock: (via: ServiceId) => void;
  signOut: () => void;
  setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  signInMock: (via) =>
    set({
      isAuthenticated: true,
      user: {
        id: ME.id,
        displayName: ME.displayName,
        email: ME.email,
        defaultService: via,
        connectedServices: [via],
        mapVariant: 0,
        createdAt: new Date(0).toISOString(),
      },
    }),
  signOut: () => set({ user: null, isAuthenticated: false }),
  setUser: (u) => set({ user: u, isAuthenticated: !!u }),
}));
