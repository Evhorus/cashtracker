import { Injectable } from '@nestjs/common';

import { DashboardBreakdownTotalDto } from './dto/dashboard-breakdown-total-response.dto';
import { DashboardCategoryBreakdownDto } from './dto/dashboard-category-breakdown-response.dto';
import { DashboardEnvelopeBreakdownDto } from './dto/dashboard-envelope-breakdown-response.dto';
import { DashboardNameBreakdownDto } from './dto/dashboard-name-breakdown-response.dto';
import { DashboardRecentExpenseDto } from './dto/dashboard-recent-expense-response.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';
import { DashboardRepository } from './repositories/dashboard.repository';

interface BreakdownFilters {
  year?: number;
  startDate?: string;
  endDate?: string;
}

const CHART_MONTHS_LIMIT = 12;

export const RECENT_EXPENSES_DEFAULT_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getSummary(
    userId: string,
    year?: number,
    currency?: string,
  ): Promise<DashboardSummaryResponseDto> {
    // Envelope totals are never date-filtered; `year` scopes only the chart.
    const [currencyAggregates, availableYears] = await Promise.all([
      this.dashboardRepository.getSummaryAggregate(userId),
      this.dashboardRepository.getAvailableYears(userId),
    ]);

    const primaryCurrency = currencyAggregates[0]?.currency;
    // Honor requested currency only if the user has envelopes in it; otherwise fall back to primary.
    const chartCurrency =
      (currency &&
        currencyAggregates.find((row) => row.currency === currency)
          ?.currency) ||
      primaryCurrency ||
      null;

    const monthlySpending = chartCurrency
      ? await this.dashboardRepository.getMonthlySpending(
          userId,
          year,
          CHART_MONTHS_LIMIT,
          chartCurrency,
        )
      : [];

    return {
      totalEnvelopes: currencyAggregates.reduce(
        (sum, row) => sum + row.count,
        0,
      ),
      totals: currencyAggregates.map((row) => ({
        currency: row.currency,
        totalEnvelopes: row.count,
        totalAssigned: row.totalAssigned,
        totalSpent: row.totalSpent,
        totalSpentCapped: row.cappedSpent,
        totalAvailable: row.totalAvailable,
        totalExceeded: row.totalExceeded,
      })),
      chart: monthlySpending.map((row) => ({
        month: row.month,
        spent: row.spent,
      })),
      chartCurrency,
      availableYears,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    currency: string,
    filters: BreakdownFilters = {},
  ): Promise<DashboardCategoryBreakdownDto[]> {
    return this.dashboardRepository.getCategoryBreakdown(
      userId,
      currency,
      filters,
    );
  }

  async getEnvelopeBreakdown(
    userId: string,
    currency: string,
    filters: BreakdownFilters = {},
  ): Promise<DashboardEnvelopeBreakdownDto[]> {
    return this.dashboardRepository.getEnvelopeBreakdown(
      userId,
      currency,
      filters,
    );
  }

  async getNameBreakdown(
    userId: string,
    currency: string,
    filters: BreakdownFilters = {},
  ): Promise<DashboardNameBreakdownDto[]> {
    return this.dashboardRepository.getNameBreakdown(userId, currency, filters);
  }

  async getBreakdownTotal(
    userId: string,
    currency: string,
    filters: BreakdownFilters = {},
  ): Promise<DashboardBreakdownTotalDto> {
    return this.dashboardRepository.getBreakdownTotal(
      userId,
      currency,
      filters,
    );
  }

  async getRecentExpenses(
    userId: string,
    limit: number = RECENT_EXPENSES_DEFAULT_LIMIT,
  ): Promise<DashboardRecentExpenseDto[]> {
    return this.dashboardRepository.getRecentExpenses(userId, limit);
  }
}
