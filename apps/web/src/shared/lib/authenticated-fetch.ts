import "server-only";

import { auth } from "@clerk/nextjs/server";

import { env } from "@/shared/config/env.server";

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

  // Always read fresh by default so changes from any device appear immediately.
  return fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });
}
