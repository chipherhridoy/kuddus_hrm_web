"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { UserDto, AuthResponse } from "./types";
import { fetchApi } from "./api";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getInitialUser(): UserDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as UserDto) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<UserDto | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({ message: "Login failed" }));
        return { success: false, error: err.message || "Invalid credentials" };
      }
    } catch {
      return { success: false, error: "Network error connecting to API server." };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchApi("/users/me");
      if (res.ok) {
        const freshUser: UserDto = await res.json();
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      let isMounted = true;
      fetchApi("/users/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((freshUser: UserDto | null) => {
          if (isMounted && freshUser) {
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === "Admin",
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
