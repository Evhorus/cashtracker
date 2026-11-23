import { describe, expect, it } from "vitest";
import {
  isValidUuid,
  parseCurrencyParam,
  parseIsoDateParam,
  parseYearParam,
  sanitizeUuidListParam,
} from "./url-params";

describe("isValidUuid", () => {
  it("accepts canonical UUIDs and rejects malformed strings", () => {
    expect(isValidUuid("5b8e2c4e-1f3a-4c7e-9d2b-8a6f0e1c2d3b")).toBe(true);
    expect(isValidUuid("5B8E2C4E-1F3A-4C7E-9D2B-8A6F0E1C2D3B")).toBe(true);
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("../envelopes")).toBe(false);
    expect(isValidUuid(undefined)).toBe(false);
  });
});

describe("parseIsoDateParam", () => {
  it("accepts real calendar dates and rejects invalid ones", () => {
    expect(parseIsoDateParam("2026-08-12")).toBe("2026-08-12");
    expect(parseIsoDateParam("2024-02-29")).toBe("2024-02-29");
    expect(parseIsoDateParam("2026-02-29")).toBeUndefined();
    expect(parseIsoDateParam("2026-13-01")).toBeUndefined();
    expect(parseIsoDateParam("foo")).toBeUndefined();
    expect(parseIsoDateParam("2026-08-12T00:00:00.000Z")).toBeUndefined();
    expect(parseIsoDateParam(undefined)).toBeUndefined();
  });
});

describe("parseYearParam", () => {
  it("accepts 4-digit years within 2000..2100", () => {
    expect(parseYearParam("2026")).toBe(2026);
    expect(parseYearParam("2000")).toBe(2000);
    expect(parseYearParam("2100")).toBe(2100);
    expect(parseYearParam("1999")).toBeUndefined();
    expect(parseYearParam("2101")).toBeUndefined();
    expect(parseYearParam("2026abc")).toBeUndefined();
    expect(parseYearParam("foo")).toBeUndefined();
  });
});

describe("parseCurrencyParam", () => {
  it("accepts supported currency codes and rejects unknown values", () => {
    expect(parseCurrencyParam("COP")).toBe("COP");
    expect(parseCurrencyParam("USD")).toBe("USD");
    expect(parseCurrencyParam("EUR")).toBe("EUR");
    expect(parseCurrencyParam("BTC")).toBeUndefined();
    expect(parseCurrencyParam("toString")).toBeUndefined();
  });
});

describe("sanitizeUuidListParam", () => {
  const validId = "5b8e2c4e-1f3a-4c7e-9d2b-8a6f0e1c2d3b";

  it("keeps valid UUIDs and allowed sentinels, dropping junk", () => {
    expect(sanitizeUuidListParam(`${validId},none,invalid`, ["none"])).toBe(
      `${validId},none`,
    );
    expect(sanitizeUuidListParam("invalid,junk", ["none"])).toBeUndefined();
    expect(sanitizeUuidListParam(undefined, ["none"])).toBeUndefined();
  });
});
