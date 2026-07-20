import { create } from "zustand";
interface User {
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
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user });
  },
  setLoading: (isLoading) => set({ isLoading }),
  hydrate: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
