import "server-only";

import { auth } from "@clerk/nextjs/server";

import { env } from "@/shared/config/env.server";

const DEFAULT_TIMEOUT_MS = 15_000;

export type AuthenticatedFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function authenticatedFetch(
  path: string,
  options?: AuthenticatedFetchOptions,
): Promise<Response> {
  const { getToken } = await auth.protect();
  const token = await getToken();

  const url = path.startsWith("http") ? path : `${env.API_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const timeoutSignal = AbortSignal.timeout(DEFAULT_TIMEOUT_MS);
  const signal = options?.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  // Always read fresh by default so changes from any device appear immediately.
  return fetch(url, {
    cache: "no-store",
    ...options,
    headers,
    signal,
  });
}
