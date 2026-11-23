import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guards for the rule "what one device writes, every device
 * sees on its next load". They read the source rather than run it: the
 * failure they stop is a convenient optimisation or a forgotten call
 * added later, which no behavioural test of today's code would notice.
 */

const SRC = join(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)
      ? [path]
      : [];
  });
}

const files = sourceFiles(SRC);

describe("data freshness", () => {
  it("has no persistent data cache anywhere", () => {
    const offenders = files.filter((file) =>
      /unstable_cache|["']use cache|next:\s*\{[^}]*(revalidate|tags)/.test(
        readFileSync(file, "utf8"),
      ),
    );

    expect(offenders).toEqual([]);
  });

  it("never overrides the no-store default with a persistent cache mode", () => {
    // authenticatedFetch spreads the caller's options after its default, so
    // a read passing cache: "force-cache" would silently win.
    const offenders = files.filter((file) =>
      /\bcache:\s*["'](?!no-store)/.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  it("refreshes the dashboard after every write action", () => {
    const actions = files.filter(
      (file) => file.endsWith(".action.ts") && !file.includes("/locale/"),
    );
    expect(actions.length).toBeGreaterThan(0);

    const missing = actions.filter(
      (file) => !readFileSync(file, "utf8").includes("refreshDashboard();"),
    );

    expect(missing).toEqual([]);
  });
});
