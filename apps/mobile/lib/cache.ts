import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEntry<T> {
  readonly data: T;
  readonly cachedAt: number;
  readonly ttlMs: number;
}

const CACHE_PREFIX = "cache_";

export async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;

  const entry = JSON.parse(raw) as CacheEntry<T>;
  const isExpired = Date.now() - entry.cachedAt > entry.ttlMs;

  if (isExpired) {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }

  return entry.data;
}

export async function set<T>(
  key: string,
  data: T,
  ttlMs: number,
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    cachedAt: Date.now(),
    ttlMs,
  };
  await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
}

export async function invalidate(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

export async function clearAll(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys as string[]);
  }
}

export const TTL = {
  PROFILE: 5 * 60 * 1000,
  DASHBOARD: 2 * 60 * 1000,
  LIFESTYLE_PLAN: 30 * 60 * 1000,
  SUPPLEMENT_REF: 24 * 60 * 60 * 1000,
  TRENDS: 5 * 60 * 1000,
} as const;
