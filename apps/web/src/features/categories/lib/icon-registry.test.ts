import { describe, expect, it } from "vitest";

import { iconLabel, searchIcons } from "./icon-keywords";
import { resolveIcon } from "./icon-registry";

const KEYS = ["house", "bath", "shopping-bag", "utensils", "tag"];

describe("searchIcons", () => {
  it("returns every key, in order, for an empty query", () => {
    expect(searchIcons(KEYS, "   ")).toEqual(KEYS);
  });

  it("matches the Spanish keywords", () => {
    expect(searchIcons(KEYS, "restaurante")).toEqual(["utensils"]);
  });

  it("ignores accents and case in both directions", () => {
    expect(searchIcons(KEYS, "BAÑO")).toEqual(["bath"]);
    expect(searchIcons(KEYS, "alcancía")).toEqual([]);
  });

  it("matches the key itself, hyphen or space", () => {
    expect(searchIcons(KEYS, "shopping bag")).toEqual(["shopping-bag"]);
    expect(searchIcons(KEYS, "shopping-bag")).toEqual(["shopping-bag"]);
  });

  it("needs every typed word to match", () => {
    expect(searchIcons(KEYS, "casa arriendo")).toEqual(["house"]);
    expect(searchIcons(KEYS, "casa restaurante")).toEqual([]);
  });

  it("still finds a key the registry has no keywords for", () => {
    expect(searchIcons(["brand-new"], "brand")).toEqual(["brand-new"]);
  });
});

describe("resolveIcon", () => {
  it("falls back to the tag icon for an unknown key", () => {
    expect(resolveIcon("does-not-exist")).toBe(resolveIcon("tag"));
  });
});

describe("iconLabel", () => {
  it("reads the Spanish name in Spanish", () => {
    expect(iconLabel("house", "es")).toBe("Casa");
    expect(iconLabel("shopping-bag", "es-CO")).toBe("Compras");
  });

  it("undoes the hyphens of the key in other locales", () => {
    expect(iconLabel("shopping-bag", "en")).toBe("Shopping bag");
  });

  it("falls back to the key for an icon with no keywords", () => {
    expect(iconLabel("brand-new", "es")).toBe("Brand new");
  });
});
