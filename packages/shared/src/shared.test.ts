import { describe, expect, it } from "vitest";

import {
  CURRENCY_CODES,
  CategoriesApiSchema,
  CategoryOptionsApiSchema,
  CategoryUsageApiSchema,
  Currency,
  CurrencyCodeSchema,
  DashboardBreakdownTotalApiSchema,
  DashboardCategoryBreakdownApiSchema,
  DashboardEnvelopeBreakdownApiSchema,
  DashboardNameBreakdownApiSchema,
  DashboardRecentExpensesApiSchema,
  DashboardSummaryApiSchema,
  ENVELOPE_PROGRESS_STATUSES,
  ENVELOPE_SORTS,
  ENVELOPE_STATUS_FILTERS,
  EnvelopeApiSchema,
  EnvelopesApiSchema,
  ExpenseApiSchema,
  ExpensesApiSchema,
  ICON_KEYS,
  MAX_AMOUNT,
  MAX_PAGE_SIZE,
  PAYMENT_METHOD_TYPES,
  PRESET_COLORS,
  PaymentMethodsApiSchema,
  TYPES_WITH_CUT_DAY,
} from "./index.js";

describe("shared constants", () => {
  it("keeps Currency lookup aligned with CURRENCY_CODES", () => {
    expect(Object.values(Currency)).toEqual([...CURRENCY_CODES]);
    for (const code of CURRENCY_CODES) {
      expect(CurrencyCodeSchema.parse(code)).toBe(code);
    }
    expect(CurrencyCodeSchema.safeParse("GBP").success).toBe(false);
  });

  it("keeps ICON_KEYS unique and preserves the original 15 API keys first", () => {
    expect(new Set(ICON_KEYS).size).toBe(ICON_KEYS.length);
    expect(ICON_KEYS.slice(0, 15)).toEqual([
      "house",
      "car",
      "piggy-bank",
      "briefcase",
      "user",
      "paw-print",
      "plane",
      "ticket",
      "heart",
      "shopping-bag",
      "utensils",
      "graduation-cap",
      "gift",
      "zap",
      "tag",
    ]);
  });

  it("keeps PRESET_COLORS unique valid oklch strings", () => {
    expect(new Set(PRESET_COLORS).size).toBe(PRESET_COLORS.length);
    for (const color of PRESET_COLORS) {
      expect(color).toMatch(/^oklch\(/);
    }
  });

  it("keeps domain limits and enum lists consistent", () => {
    expect(MAX_AMOUNT).toBe(9_999_999_999.99);
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(
      TYPES_WITH_CUT_DAY.every((t) => PAYMENT_METHOD_TYPES.includes(t)),
    ).toBe(true);
    for (const status of ENVELOPE_PROGRESS_STATUSES) {
      expect(ENVELOPE_STATUS_FILTERS).toContain(status);
    }
    expect(ENVELOPE_SORTS).toEqual(["recent", "oldest"]);
  });
});

describe("shared API schemas", () => {
  it("parses envelope and expense payloads", () => {
    const expense = ExpenseApiSchema.parse({
      id: "exp-1",
      name: "Groceries",
      amount: "50000.00",
      currency: "COP",
      date: "2026-11-25",
      description: null,
      paymentMethod: {
        id: "pm-1",
        name: "Visa",
        color: PRESET_COLORS[0],
      },
      createdAt: "2026-11-25T10:00:00.000Z",
      updatedAt: "2026-11-25T10:00:00.000Z",
    });

    const envelope = EnvelopeApiSchema.parse({
      id: "env-1",
      name: "Food",
      amount: "500000.00",
      currency: "COP",
      spent: "50000.00",
      status: "normal",
      category: {
        id: "cat-1",
        label: "Hogar",
        color: PRESET_COLORS[0],
        icon: ICON_KEYS[0],
      },
      firstExpenseDate: "2026-11-01",
      lastExpenseDate: "2026-11-25",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-25T10:00:00.000Z",
      expenses: [expense],
    });

    expect(
      EnvelopesApiSchema.parse({
        data: [envelope],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }).data,
    ).toHaveLength(1);

    expect(
      ExpensesApiSchema.parse({
        data: [expense],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          totalAmount: "50000.00",
        },
      }).meta.totalAmount,
    ).toBe(50000);
  });

  it("parses categories, payment methods, and dashboard payloads", () => {
    expect(
      CategoriesApiSchema.parse([
        {
          id: "cat-1",
          label: "Hogar",
          color: PRESET_COLORS[0],
          icon: ICON_KEYS[0],
          isDefault: true,
          createdAt: "2026-11-01T00:00:00.000Z",
          updatedAt: "2026-11-01T00:00:00.000Z",
        },
      ]),
    ).toHaveLength(1);

    expect(
      CategoryOptionsApiSchema.parse({
        icons: [...ICON_KEYS],
        colors: [...PRESET_COLORS],
      }).icons.length,
    ).toBe(ICON_KEYS.length);

    expect(
      CategoryUsageApiSchema.parse([{ categoryId: "cat-1", envelopeCount: 2 }]),
    ).toHaveLength(1);

    expect(
      PaymentMethodsApiSchema.parse([
        {
          id: "pm-1",
          name: "Visa",
          type: "credit_card",
          color: PRESET_COLORS[0],
          cutDay: 15,
        },
      ]),
    ).toHaveLength(1);

    expect(
      DashboardSummaryApiSchema.parse({
        totalEnvelopes: 1,
        totals: [
          {
            currency: "COP",
            totalEnvelopes: 1,
            totalAssigned: 500000,
            totalSpent: 50000,
            totalSpentCapped: 50000,
            totalAvailable: 450000,
            totalExceeded: 0,
          },
        ],
        chart: [{ month: "2026-11", spent: 50000 }],
        chartCurrency: "COP",
        availableYears: [2026],
      }).chartCurrency,
    ).toBe("COP");

    expect(
      DashboardRecentExpensesApiSchema.parse([
        {
          id: "exp-1",
          name: "Groceries",
          amount: 50000,
          currency: "COP",
          date: "2026-11-25",
          envelopeId: "env-1",
          envelopeName: "Food",
        },
      ]),
    ).toHaveLength(1);

    expect(
      DashboardCategoryBreakdownApiSchema.parse([
        { category: null, spent: 50000, expenseCount: 1 },
      ]),
    ).toHaveLength(1);

    expect(
      DashboardEnvelopeBreakdownApiSchema.parse([
        {
          envelopeId: "env-1",
          envelopeName: "Food",
          spent: 50000,
          expenseCount: 1,
          firstExpenseDate: "2026-11-01",
          lastExpenseDate: "2026-11-25",
        },
      ]),
    ).toHaveLength(1);

    expect(
      DashboardNameBreakdownApiSchema.parse([
        { name: "Groceries", spent: 50000, expenseCount: 1 },
      ]),
    ).toHaveLength(1);

    expect(
      DashboardBreakdownTotalApiSchema.parse({
        spent: 50000,
        expenseCount: 1,
      }).expenseCount,
    ).toBe(1);
  });
});
