import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthUser } from '../api/auth';
import { setAccessToken } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: Parameters<typeof authApi.register>[0]) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Updates the in-memory user without a network round-trip — call this after any
   * profile/avatar/password-adjacent mutation so the navbar, dashboards, etc. stay in sync. */
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt silent refresh on first load (relies on the httpOnly cookie).
  useEffect(() => {
    (async () => {
      try {
        const { user, accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        setUser(user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { user, accessToken } = await authApi.login(email, password);
    setAccessToken(accessToken);
    setUser(user);
    return user;
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const { user, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(user);
    return user;
  }

  async function logout() {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
  }

  function updateUser(updated: AuthUser) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
