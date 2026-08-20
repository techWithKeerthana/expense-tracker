import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { notificationImportService, PermissionStatus } from '../services/notificationImportService';
import { smartImportStorage } from '../storage/smartImportStorage';
import { pendingImportStorage, PendingImport } from '../storage/pendingImportStorage';

interface SmartImportContextValue {
  isSupported: boolean;
  isLoading: boolean;
  enabled: boolean;
  permissionStatus: PermissionStatus;
  pendingImports: PendingImport[];
  setEnabled: (value: boolean) => Promise<void>;
  openNotificationAccessSettings: () => void;
  refreshPermissionStatus: () => Promise<void>;
  refreshPendingImports: () => Promise<void>;
  dismissImport: (id: string) => Promise<void>;
}

const SmartImportContext = createContext<SmartImportContextValue | undefined>(undefined);

export function SmartImportProvider({ children }: { children: React.ReactNode }) {
  const isSupported = Platform.OS === 'android';
  const [isLoading, setIsLoading] = useState(true);
  const [enabled, setEnabledState] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown');
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);

  const refreshPermissionStatus = useCallback(async () => {
    setPermissionStatus(await notificationImportService.getPermissionStatus());
  }, []);

  const refreshPendingImports = useCallback(async () => {
    setPendingImports(await pendingImportStorage.getAll());
  }, []);

  useEffect(() => {
    (async () => {
      const [storedEnabled] = await Promise.all([smartImportStorage.isEnabled(), refreshPermissionStatus(), refreshPendingImports()]);
      setEnabledState(storedEnabled);
      setIsLoading(false);
    })();
  }, [refreshPermissionStatus, refreshPendingImports]);

  const setEnabled = useCallback(async (value: boolean) => {
    await smartImportStorage.setEnabled(value);
    setEnabledState(value);
  }, []);

  const dismissImport = useCallback(
    async (id: string) => {
      await pendingImportStorage.remove(id);
      await refreshPendingImports();
    },
    [refreshPendingImports]
  );

  const value = useMemo(
    () => ({
      isSupported,
      isLoading,
      enabled,
      permissionStatus,
      pendingImports,
      setEnabled,
      openNotificationAccessSettings: notificationImportService.openNotificationAccessSettings,
      refreshPermissionStatus,
      refreshPendingImports,
      dismissImport,
    }),
    [isSupported, isLoading, enabled, permissionStatus, pendingImports, setEnabled, refreshPermissionStatus, refreshPendingImports, dismissImport]
  );

  return <SmartImportContext.Provider value={value}>{children}</SmartImportContext.Provider>;
}

export function useSmartImport(): SmartImportContextValue {
  const ctx = useContext(SmartImportContext);
  if (!ctx) throw new Error('useSmartImport must be used within a SmartImportProvider');
  return ctx;
}
