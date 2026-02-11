import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, UserRole } from "@/types";
import { auth as authApi, setToken, setRefreshToken, clearToken, clearRefreshToken, getToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapApiUser(apiUser: { id: number; email: string; full_name: string; role: string; phone?: string }): User {
  return {
    id: String(apiUser.id),
    fullName: apiUser.full_name,
    email: apiUser.email,
    phone: apiUser.phone || "",
    role: apiUser.role as UserRole,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and load profile
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.getProfile()
        .then((apiUser) => setUser(mapApiUser(apiUser)))
        .catch(() => { clearToken(); clearRefreshToken(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.access);
    setRefreshToken(res.refresh);
    setUser(mapApiUser(res.user));
  }, []);

  const register = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: UserRole }) => {
    const res = await authApi.register({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      phone: data.phone,
      role: data.role,
    });
    setToken(res.access);
    setRefreshToken(res.refresh);
    setUser(mapApiUser(res.user));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearRefreshToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
