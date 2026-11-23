/**
 * JSON client for the API, shared by every module's HTTP adapters. `path` is
 * relative to the API root (`/children`, `/journal/entries`). A call resolves
 * with the response body (`undefined` when there is none) or rejects with an
 * `ApiError`. `T` is what the caller expects: the body is not validated.
 */
export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
