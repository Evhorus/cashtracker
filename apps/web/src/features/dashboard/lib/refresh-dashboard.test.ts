import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

const { refreshDashboard } = await import("./refresh-dashboard");

describe("refreshDashboard", () => {
  beforeEach(() => revalidatePath.mockClear());

  it("revalidates the whole dashboard layout, so no page under it is missed", () => {
    refreshDashboard();

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });
});
