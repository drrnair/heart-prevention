import * as cache from "./cache";
import { api } from "./api";

export async function cachedGet<T>(
  cacheKey: string,
  path: string,
  ttlMs: number,
  setData: (data: T) => void,
): Promise<T | null> {
  // 1. Check cache — if hit, call setData immediately
  const cached = await cache.get<T>(cacheKey);
  if (cached !== null) {
    setData(cached);
  }

  // 2. Fetch fresh from API
  const response = await api.get<T>(path);

  // 3. If fresh data received, cache it and call setData
  if (response.data !== null) {
    await cache.set(cacheKey, response.data, ttlMs);
    setData(response.data);
    return response.data;
  }

  // 4. Return cached data if API failed
  return cached;
}
