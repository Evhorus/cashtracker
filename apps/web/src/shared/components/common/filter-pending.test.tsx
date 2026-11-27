/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
let currentPathname = "/dashboard/items";
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

const {
  FilterPendingProvider,
  FilterResultsSlot,
  canonicalizeHref,
  canonicalizeUrl,
  useFilterPending,
} = await import("./filter-pending");

function Harness() {
  const { isPending, effectiveSearchParams, updateParams, flush } =
    useFilterPending();
  const tags = (effectiveSearchParams.get("tags") ?? "")
    .split(",")
    .filter(Boolean);

  const toggleTag = (tag: string) => {
    updateParams(
      (params) => {
        const current = (params.get("tags") ?? "").split(",").filter(Boolean);
        const next = current.includes(tag)
          ? current.filter((item) => item !== tag)
          : [...current, tag];
        if (next.length > 0) params.set("tags", next.join(","));
        else params.delete("tags");
      },
      { debounceMs: 250 },
    );
  };

  return (
    <div>
      <span data-testid="pending">{String(isPending)}</span>
      <span data-testid="tags">{tags.join(",")}</span>
      <button type="button" onClick={() => toggleTag("a")}>
        toggle-a
      </button>
      <button type="button" onClick={() => toggleTag("b")}>
        toggle-b
      </button>
      <button type="button" onClick={() => flush()}>
        flush
      </button>
      <FilterResultsSlot fallback={<div>loading-skeleton</div>}>
        <div>live-results</div>
      </FilterResultsSlot>
    </div>
  );
}

describe("filter-pending", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replaceMock.mockReset();
    currentPathname = "/dashboard/items";
    currentSearch = "";
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("canonicalizes URL parameter ordering", () => {
    expect(
      canonicalizeUrl("/dashboard/items", new URLSearchParams("b=2&a=1&a=0")),
    ).toBe("/dashboard/items?a=0&a=1&b=2");
    expect(canonicalizeHref("/dashboard/items?z=9&a=1")).toBe(
      "/dashboard/items?a=1&z=9",
    );
    expect(canonicalizeHref("/dashboard/items")).toBe("/dashboard/items");
  });

  it("batches rapid debounced updates into one router.replace and renders skeleton immediately", () => {
    render(
      <FilterPendingProvider>
        <Harness />
      </FilterPendingProvider>,
    );

    expect(screen.getByText("live-results")).toBeTruthy();

    fireEvent.click(screen.getByText("toggle-a"));
    fireEvent.click(screen.getByText("toggle-b"));

    expect(screen.getByTestId("pending").textContent).toBe("true");
    expect(screen.getByTestId("tags").textContent).toBe("a,b");
    expect(screen.getByText("loading-skeleton")).toBeTruthy();
    expect(
      screen
        .getByText("loading-skeleton")
        .parentElement?.getAttribute("aria-busy"),
    ).toBe("true");
    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/items?tags=a%2Cb", {
      scroll: false,
    });
  });

  it("cancels commit and clears pending when toggled back to the live URL before debounce fires", () => {
    render(
      <FilterPendingProvider>
        <Harness />
      </FilterPendingProvider>,
    );

    fireEvent.click(screen.getByText("toggle-a"));
    expect(screen.getByTestId("pending").textContent).toBe("true");

    fireEvent.click(screen.getByText("toggle-a"));
    expect(screen.getByTestId("pending").textContent).toBe("false");
    expect(screen.getByText("live-results")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("flushes buffered updates immediately and restores children when searchParams catch up", () => {
    const { rerender } = render(
      <FilterPendingProvider>
        <Harness />
      </FilterPendingProvider>,
    );

    fireEvent.click(screen.getByText("toggle-a"));
    expect(replaceMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("flush"));
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/items?tags=a", {
      scroll: false,
    });

    currentSearch = "tags=a";
    rerender(
      <FilterPendingProvider>
        <Harness />
      </FilterPendingProvider>,
    );

    expect(screen.getByTestId("pending").textContent).toBe("false");
    expect(screen.getByText("live-results")).toBeTruthy();
  });
});
