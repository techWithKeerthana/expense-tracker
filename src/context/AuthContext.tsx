import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pinStorage } from '../storage/pinStorage';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

interface AuthContextValue {
  isLoading: boolean;
  pinEnabled: boolean;
  isUnlocked: boolean;
  lockedUntil: number | null;
  attemptsRemaining: number;
  createPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  disablePin: (currentPin: string) => Promise<boolean>;
  changePin: (currentPin: string, newPin: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const enabled = await pinStorage.isPinEnabled();
      setPinEnabled(enabled);
      setIsUnlocked(!enabled);
      setIsLoading(false);
    })();
  }, []);

  const createPin = useCallback(async (pin: string) => {
    await pinStorage.savePin(pin);
    setPinEnabled(true);
    setIsUnlocked(true);
  }, []);

  const unlock = useCallback(
    async (pin: string) => {
      if (lockedUntil && Date.now() < lockedUntil) return false;
      if (lockedUntil && Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setFailedAttempts(0);
      }
      const valid = await pinStorage.verifyPin(pin);
      if (valid) {
        setIsUnlocked(true);
        setFailedAttempts(0);
        setLockedUntil(null);
      } else {
        setFailedAttempts((prev) => {
          const next = prev + 1;
          if (next >= MAX_ATTEMPTS) {
            setLockedUntil(Date.now() + LOCKOUT_MS);
            return 0;
          }
          return next;
        });
      }
      return valid;
    },
    [lockedUntil]
  );

  const disablePin = useCallback(async (currentPin: string) => {
    const valid = await pinStorage.verifyPin(currentPin);
    if (!valid) return false;
    await pinStorage.clearPin();
    setPinEnabled(false);
    return true;
  }, []);

  const changePin = useCallback(async (currentPin: string, newPin: string) => {
    const valid = await pinStorage.verifyPin(currentPin);
    if (!valid) return false;
    await pinStorage.savePin(newPin);
    return true;
  }, []);

  const lock = useCallback(() => setIsUnlocked(false), []);

  const value = useMemo(
    () => ({
      isLoading,
      pinEnabled,
      isUnlocked,
      lockedUntil,
      attemptsRemaining: MAX_ATTEMPTS - failedAttempts,
      createPin,
      unlock,
      disablePin,
      changePin,
      lock,
    }),
    [isLoading, pinEnabled, isUnlocked, lockedUntil, failedAttempts, createPin, unlock, disablePin, changePin, lock]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
