/**
 * Low-level HTTP client for REMEDY-BACK-V3 (NestJS, global prefix `api/v1`).
 *  - Base URL from services/config (per-platform default + env override).
 *  - JWT bearer auth: token persisted in expo-secure-store, cached in memory.
 *  - Strict backend: ValidationPipe rejects unknown body fields, so callers must
 *    send exactly the DTO shape.
 *
 * The backend returns a typed error envelope
 *   { statusCode, code, message, timestamp, path }
 * which `ApiError` surfaces (code + message) so the UI can show 친절한 메시지.
 */
import * as SecureStore from 'expo-secure-store';
import { config } from '@/services/config';

const TOKEN_KEY = 'remedy_access_token';

let memoryToken: string | null = null;

/** Load the persisted JWT into memory (call once at app start). */
export async function loadToken(): Promise<string | null> {
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

export function getToken(): string | null {
  return memoryToken;
}

export async function setToken(token: string | null): Promise<void> {
  memoryToken = token;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** send the bearer token (default true). */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  let url = `${config.apiBaseUrl}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }
  return url;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, query } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && memoryToken) headers.Authorization = `Bearer ${memoryToken}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // Network failure (backend down / unreachable host on emulator).
    throw new ApiError(0, '서버에 연결할 수 없어요. 네트워크를 확인해주세요.');
  }

  // 204 / empty body (POST create endpoints return void).
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const env = (data ?? {}) as { message?: string | string[]; code?: string };
    const msg = Array.isArray(env.message) ? env.message.join(', ') : env.message;
    throw new ApiError(res.status, msg || `요청에 실패했어요 (${res.status})`, env.code);
  }

  return data as T;
}

export const apiGet = <T>(path: string, query?: RequestOptions['query'], auth = true) =>
  request<T>(path, { method: 'GET', query, auth });
export const apiPost = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'POST', body, auth });
export const apiPut = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'PUT', body, auth });
export const apiPatch = <T>(path: string, body?: unknown, auth = true) =>
  request<T>(path, { method: 'PATCH', body, auth });
export const apiDelete = <T>(path: string, auth = true) =>
  request<T>(path, { method: 'DELETE', auth });
