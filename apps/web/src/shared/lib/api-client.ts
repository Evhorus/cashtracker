import type { z } from "zod";

import {
  authenticatedFetch,
  type AuthenticatedFetchOptions,
} from "./authenticated-fetch";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function extractApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return null;
  }

  const { message } = data as { message?: unknown };
  if (typeof message === "string") {
    return message.trim() || null;
  }
  if (Array.isArray(message)) {
    const joined = message
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join(". ");
    return joined || null;
  }
  return null;
}

export async function fetchApi<T>(
  path: string,
  options?: AuthenticatedFetchOptions,
  schema?: z.ZodSchema<T>,
): Promise<T> {
  const response = await authenticatedFetch(path, options);

  const contentType = response.headers.get("content-type");
  const data: unknown = contentType?.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractApiErrorMessage(data) ||
        response.statusText ||
        "API request error",
      data,
    );
  }

  if (!schema) {
    return data as T;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`API Validation Error at ${path}:`, result.error.issues);
    throw new ApiError(
      response.status,
      "Server response does not match the expected format.",
      result.error,
    );
  }

  return result.data as T;
}
