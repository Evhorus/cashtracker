import { describe, expect, it } from "vitest";

import type { Envelope } from "@/features/envelopes/types";
import type { Expense } from "@/features/expenses/types";
import { ExpenseHelpers } from "./expense-helpers";

function expense(amount: string): Expense {
  return {
    id: "x",
    name: "Gasto",
    amount,
    date: new Date("2026-09-22T00:00:00Z"),
    paymentMethod: null,
    createdAt: new Date("2026-09-22T00:00:00Z"),
    updatedAt: new Date("2026-09-22T00:00:00Z"),
  };
}

function envelope(amount: string | null): Envelope {
  return {
    id: "e",
    name: "Sobre",
    amount,
    currency: "COP",
    spent: "0",
    status: amount === null ? "unlimited" : "normal",
    category: null,
    expenses: [],
    expenseDateRange: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

describe("getImpactPercentage", () => {
  it("is the share of the envelope's limit", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope("1000")),
    ).toBe(25);
  });

  it("is null for an unlimited envelope", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope(null)),
    ).toBeNull();
  });

  it("is null when the envelope limit is zero or negative", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope("0")),
    ).toBeNull();
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope("-100")),
    ).toBeNull();
  });

  it("can exceed 100 for a single expense past the whole limit", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("1500"), envelope("1000")),
    ).toBe(150);
  });
});
