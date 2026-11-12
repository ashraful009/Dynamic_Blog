import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

