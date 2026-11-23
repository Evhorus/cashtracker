import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Every read goes through this wrapper, so this is where "the backend is
 * asked every time" is decided. A finance app used from several devices
 * cannot show a figure another device already changed.
 */

vi.mock("server-only", () => ({}));
vi.mock("@/shared/config/env.server", () => ({
  env: { API_URL: "http://api.test/api" },
}));
vi.mock("@clerk/nextjs/server", () => {
  const auth = Object.assign(
    vi.fn(async () => ({ getToken: async () => "token-1" })),
    {
      protect: vi.fn(async () => ({ getToken: async () => "token-1" })),
    },
  );
  return { auth };
});

const { authenticatedFetch } = await import("./authenticated-fetch");

const fetchSpy = vi.fn(async () => new Response("{}"));

beforeEach(() => {
  fetchSpy.mockClear();
  vi.stubGlobal("fetch", fetchSpy);
});

const lastInit = () => (fetchSpy.mock.calls[0] as unknown[])[1] as RequestInit;

describe("authenticatedFetch", () => {
  it("never reads from or writes to the fetch cache by default", async () => {
    await authenticatedFetch("/envelopes");

    expect(lastInit().cache).toBe("no-store");
  });

  it("sends the session token and builds the URL from the API base", async () => {
    await authenticatedFetch("/envelopes");

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://api.test/api/envelopes");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer token-1",
    );
  });

  it("lets a caller opt in to caching deliberately", async () => {
    await authenticatedFetch("/x", { cache: "force-cache" });

    expect(lastInit().cache).toBe("force-cache");
  });
});
