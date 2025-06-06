"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { request } from "@/services/api/request";
import { TokenResponse } from "@/types/user";

interface TokenContextProps {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

const REFRESH_THRESHOLD_SECONDS = 5 * 60; // refresh 5 minutes before expiry

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const parseExpiry = (tok: string): number | null => {
    try {
      const [, payload] = tok.split(".");
      const decoded = JSON.parse(atob(payload));
      return typeof decoded.exp === "number" ? decoded.exp : null;
    } catch {
      return null;
    }
  };

  const scheduleRefresh = (tok: string) => {
    const exp = parseExpiry(tok);
    if (!exp) return;
    const nowSec = Math.floor(Date.now() / 1000);
    const timeoutSec = exp - nowSec - REFRESH_THRESHOLD_SECONDS;
    if (timeoutSec <= 0) {
      refreshToken(tok);
    } else {
      if (refreshTimer) clearTimeout(refreshTimer);
      const id = setTimeout(() => refreshToken(tok), timeoutSec * 1000);
      setRefreshTimer(id);
    }
  };

  const setToken = (tok: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", tok);
    }
    setTokenState(tok);
    scheduleRefresh(tok);
  };

  const clearToken = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setTokenState(null);
  };

  const refreshToken = async (current: string) => {
    try {
      const response = await request<TokenResponse>("/api/v1/auth/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${current}` },
      });
      setToken(response.access_token);
    } catch {
      clearToken();
    }
  };

  useEffect(() => {
    const existing = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (existing) {
      setTokenState(existing);
      scheduleRefresh(existing);
    }
  }, []);

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = (): TokenContextProps => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};
