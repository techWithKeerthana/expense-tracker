import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, ApiError } from '../services/apiClient';
import { accountStorage } from '../storage/accountStorage';
import { AuthUser } from '../types';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AccountContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([accountStorage.getToken(), accountStorage.getUser()]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, password });
      await accountStorage.saveSession(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof ApiError ? err.message : 'Could not reach the server.' };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
      await accountStorage.saveSession(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof ApiError ? err.message : 'Could not reach the server.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await accountStorage.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isLoading, isAuthenticated: Boolean(token && user), user, token, register, login, logout }),
    [isLoading, token, user, register, login, logout]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider');
  return ctx;
}
