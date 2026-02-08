import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (_email: string, _password: string) => {
    // API placeholder — replace with actual API call
    // For now, simulate a tenant login for development
    setUser({
      id: "demo-user",
      fullName: "Demo User",
      email: _email,
      phone: "+255700000000",
      role: "tenant",
    });
  }, []);

  const register = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: UserRole }) => {
    // API placeholder — replace with actual API call
    setUser({
      id: "new-user",
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
