import { supabase } from "./supabase";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiResponse<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly status: number;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: json.detail ?? json.message ?? "Request failed",
        status: response.status,
      };
    }

    return {
      data: json as T,
      error: null,
      status: response.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      data: null,
      error: message,
      status: 0,
    };
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
} as const;

export type { ApiResponse, PaginatedResponse };
