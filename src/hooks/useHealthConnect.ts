import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
} from 'react-native-health-connect';
import { useFitnessStore } from '@/store/fitnessStore';

export type HealthSyncStatus = 'idle' | 'connecting' | 'syncing' | 'success' | 'error' | 'unavailable';

export interface HealthConnectSyncResult {
  steps: number;
  weightLogs: number;
  waterLogs: number;
}

const PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Weight' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Hydration' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'write', recordType: 'Weight' },
  { accessType: 'write', recordType: 'Hydration' },
] as const;

function isoToDateString(iso: string) {
  return iso.split('T')[0];
}

function getDateRange(daysBack: number) {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

function startOfToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

export function useHealthConnect() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<HealthSyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<HealthConnectSyncResult | null>(null);

  // Health Connect only exists on Android; gracefully no-op on iOS/web
  const isSupported = Platform.OS === 'android';

  useEffect(() => {
    if (!isSupported) {
      setIsAvailable(false);
      setStatus('unavailable');
      return;
    }
    initialize()
      .then((available) => {
        setIsAvailable(available);
        if (!available) setStatus('unavailable');
      })
      .catch(() => {
        setIsAvailable(false);
        setStatus('unavailable');
      });
  }, []);

  // Check if we already have permissions granted (reconnect after restart)
  const checkConnection = useCallback(async () => {
    if (!isSupported || !isAvailable) return false;
    try {
      const granted = await getGrantedPermissions();
      const hasSteps = granted.some((p) => (p as any).recordType === 'Steps');
      setIsConnected(hasSteps);
      return hasSteps;
    } catch {
      return false;
    }
  }, [isAvailable, isSupported]);

  useEffect(() => {
    if (isAvailable) checkConnection();
  }, [isAvailable]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isAvailable) return false;
    setStatus('connecting');
    try {
      await requestPermission(PERMISSIONS as any);
      const granted = await getGrantedPermissions();
      const hasSteps = granted.some((p) => (p as any).recordType === 'Steps');
      setIsConnected(hasSteps);
      setStatus(hasSteps ? 'idle' : 'error');
      return hasSteps;
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return false;
    }
  }, [isAvailable, isSupported]);

  // ── Sync helpers ──────────────────────────────────────────────────────────

  const syncSteps = useCallback(async (): Promise<number> => {
    const { records } = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfToday(),
        endTime: new Date().toISOString(),
      },
    });
    const totalSteps = (records as any[]).reduce((sum, r) => sum + (r.count ?? 0), 0);
    useFitnessStore.setState({ stepsCount: totalSteps });
    return totalSteps;
  }, []);

  const syncWeight = useCallback(async (daysBack = 30): Promise<number> => {
    const { records } = await readRecords('Weight', {
      timeRangeFilter: { operator: 'between', ...getDateRange(daysBack) },
    });

    const incoming = (records as any[]).map((r) => ({
      id: `hc-${r.metadata?.id ?? r.time}`,
      weight: r.weight?.inKilograms ?? 0,
      date: isoToDateString(r.time),
      timeOfDay: 'morning' as const,
    })).filter((l) => l.weight > 0);

    const existing = useFitnessStore.getState().weightLogs;
    const existingIds = new Set(existing.map((l) => l.id));
    const existingDates = new Set(existing.map((l) => l.date));
    const fresh = incoming.filter((l) => !existingIds.has(l.id) && !existingDates.has(l.date));

    if (fresh.length > 0) {
      useFitnessStore.setState({ weightLogs: [...fresh, ...existing] });
    }
    return fresh.length;
  }, []);

  const syncWater = useCallback(async (daysBack = 7): Promise<number> => {
    const { records } = await readRecords('Hydration', {
      timeRangeFilter: { operator: 'between', ...getDateRange(daysBack) },
    });

    const incoming = (records as any[]).map((r) => ({
      id: `hc-${r.metadata?.id ?? r.startTime}`,
      time: r.startTime,
      ml: Math.round((r.volume?.inLiters ?? 0) * 1000),
    })).filter((l) => l.ml > 0);

    const existing = useFitnessStore.getState().waterLogs;
    const existingIds = new Set(existing.map((l) => l.id));
    const fresh = incoming.filter((l) => !existingIds.has(l.id));

    if (fresh.length > 0) {
      useFitnessStore.setState({ waterLogs: [...fresh, ...existing] });
    }
    return fresh.length;
  }, []);

  const syncAll = useCallback(async (): Promise<HealthConnectSyncResult> => {
    setStatus('syncing');
    try {
      const [steps, weightLogs, waterLogs] = await Promise.all([
        syncSteps(),
        syncWeight(30),
        syncWater(7),
      ]);
      const result = { steps, weightLogs, waterLogs };
      setLastSyncResult(result);
      setLastSyncTime(new Date().toISOString());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
      return result;
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
      return { steps: 0, weightLogs: 0, waterLogs: 0 };
    }
  }, [syncSteps, syncWeight, syncWater]);

  return {
    isSupported,
    isAvailable,
    isConnected,
    status,
    lastSyncTime,
    lastSyncResult,
    connect,
    syncAll,
    checkConnection,
  };
}
