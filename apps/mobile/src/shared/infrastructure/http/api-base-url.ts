/**
 * Where the API answers, set per environment at build time through
 * `EXPO_PUBLIC_API_URL` (Expo inlines `EXPO_PUBLIC_*` variables, so the read
 * must stay written out in full). Defaults to `/api`: the PWA's Worker relays
 * it to the API on the same origin (ADR-0011). A native build has no origin
 * and must set an absolute URL.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '/api';
