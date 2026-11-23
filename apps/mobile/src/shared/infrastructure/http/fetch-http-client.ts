import {
  ApiError,
  CLIENT_ERROR_CODES,
  NO_RESPONSE_STATUS,
} from '@/shared/infrastructure/http/api-error';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';

export const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchHttpClientOptions {
  /** API root, e.g. `API_BASE_URL`; request paths are appended to it. */
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  /**
   * Native builds only: returns the session cookie the auth client keeps in
   * secure storage, sent as the `Cookie` header (ADR-0003). The web leaves it
   * out: the browser sends its `HttpOnly` cookie on its own (ADR-0010).
   */
  readonly sessionCookie?: () => string | null | undefined | Promise<string | null | undefined>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** `HttpClient` on the platform's native `fetch`. */
export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: FetchHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    // `AbortSignal.timeout` is missing from some React Native runtimes.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const cookie = await this.options.sessionCookie?.();
      if (cookie) {
        headers.Cookie = cookie;
      }
      const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
      const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'include',
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) {
        throw errorFromResponse(response.status, text);
      }
      return parseBody<T>(response.status, text);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw new ApiError(
          NO_RESPONSE_STATUS,
          CLIENT_ERROR_CODES.timeout,
          `${method} ${path} took longer than ${this.timeoutMs} ms`,
        );
      }
      throw new ApiError(
        NO_RESPONSE_STATUS,
        CLIENT_ERROR_CODES.networkUnavailable,
        `${method} ${path} could not reach the API`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

function parseBody<T>(status: number, text: string): T {
  if (text === '') {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      status,
      CLIENT_ERROR_CODES.unexpectedResponse,
      `The API answered ${status} with a body that is not JSON`,
    );
  }
}

/** The API's `{ code, message }` error body, or `UNEXPECTED_RESPONSE`. */
function errorFromResponse(status: number, text: string): ApiError {
  try {
    const body: unknown = JSON.parse(text);
    if (isErrorBody(body)) {
      return new ApiError(status, body.code, body.message);
    }
  } catch {
    // Not JSON: falls through to the generic error.
  }
  return new ApiError(
    status,
    CLIENT_ERROR_CODES.unexpectedResponse,
    `The API answered ${status} without an error code`,
  );
}

function isErrorBody(body: unknown): body is { code: string; message: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof body.code === 'string' &&
    body.code !== '' &&
    'message' in body &&
    typeof body.message === 'string'
  );
}
