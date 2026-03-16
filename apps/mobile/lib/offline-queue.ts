import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface QueuedRequest {
  readonly id: string;
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  readonly createdAt: string;
  readonly retryCount: number;
}

const QUEUE_KEY = "offline_queue";
const MAX_RETRIES = 3;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getQueue(): Promise<readonly QueuedRequest[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as readonly QueuedRequest[];
}

async function saveQueue(queue: readonly QueuedRequest[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<void> {
  const queue = await getQueue();
  const entry: QueuedRequest = {
    id: generateId(),
    method,
    path,
    body,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  await saveQueue([...queue, entry]);
}

export async function flush(): Promise<{
  readonly succeeded: number;
  readonly failed: number;
}> {
  const queue = await getQueue();
  if (queue.length === 0) return { succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;
  const remaining: QueuedRequest[] = [];

  for (const entry of queue) {
    const methodFn = getApiMethod(entry.method);
    const response = await methodFn(entry.path, entry.body);

    if (response.error) {
      const nextRetry = entry.retryCount + 1;
      if (nextRetry < MAX_RETRIES) {
        remaining.push({ ...entry, retryCount: nextRetry });
      }
      failed++;
    } else {
      succeeded++;
    }
  }

  await saveQueue(remaining);
  return { succeeded, failed };
}

export async function getQueueSize(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

function getApiMethod(
  method: HttpMethod,
): (path: string, body?: unknown) => Promise<{ readonly error: string | null }> {
  switch (method) {
    case "POST":
      return (path, body) => api.post(path, body);
    case "PUT":
      return (path, body) => api.put(path, body);
    case "PATCH":
      return (path, body) => api.patch(path, body);
    case "DELETE":
      return (path) => api.delete(path);
  }
}
