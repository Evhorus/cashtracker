import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Envelope } from '../../envelopes/entities/envelope.entity';
import { Expense } from '../../expenses/entities/expense.entity';

interface SummaryAggregateRow {
  currency: string;
  count: string;
  totalAssigned: string;
  totalSpent: string;
  cappedSpent: string;
  totalAvailable: string;
  totalExceeded: string;
}

interface RecentExpenseRow {
  id: string;
  name: string;
  amount: string;
  currency: string;
  date: string;
  envelopeId: string;
  envelopeName: string;
}

/** Read-only reporting queries for the dashboard (separate from CRUD repos). */
@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(Envelope)
    private readonly repository: Repository<Envelope>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  /** Explicit startDate/endDate bounds take precedence over the year shortcut. */
  private resolveDateBounds(filters: {
    year?: number;
    startDate?: string;
    endDate?: string;
  }): { startDate?: string; endDate?: string } {
    if (filters.startDate || filters.endDate) {
      return { startDate: filters.startDate, endDate: filters.endDate };
    }
    if (filters.year) {
      return {
        startDate: `${filters.year}-01-01`,
        endDate: `${filters.year}-12-31`,
      };
    }
    return {};
  }

  /** Base query scoped by user, currency, and each expense's own calendar date. */
  private withUserCurrencyAndDateRange(
    userId: string,
    currency: string,
    filters: { year?: number; startDate?: string; endDate?: string },
  ) {
    const qb = this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.envelope', 'envelope')
      .where('envelope.userId = :userId', { userId })
      .andWhere('expense.currency = :currency', { currency });

    const { startDate, endDate } = this.resolveDateBounds(filters);
    if (startDate) {
      qb.andWhere('expense.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('expense.date <= :endDate', { endDate });
    }

    return qb;
  }

  async getCategoryBreakdown(
    userId: string,
    currency: string,
    filters: { year?: number; startDate?: string; endDate?: string } = {},
  ) {
    const rows = await this.withUserCurrencyAndDateRange(
      userId,
      currency,
      filters,
    )
      .leftJoin('envelope.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.label', 'label')
      .addSelect('category.color', 'color')
      .addSelect('category.icon', 'icon')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'spent')
      .addSelect('COUNT(*)', 'expenseCount')
      .groupBy('category.id')
      .addGroupBy('category.label')
      .addGroupBy('category.color')
      .addGroupBy('category.icon')
      .orderBy('SUM(expense.amount)', 'DESC')
      .getRawMany<{
        categoryId: string | null;
        label: string | null;
        color: string | null;
        icon: string | null;
        spent: string;
        expenseCount: string;
      }>();

    return rows.map((row) => ({
      category: row.categoryId
        ? {
            id: row.categoryId,
            label: row.label as string,
            color: row.color as string,
            icon: row.icon as string,
          }
        : null,
      spent: Number(row.spent),
      expenseCount: Number(row.expenseCount),
    }));
  }

  async getEnvelopeBreakdown(
    userId: string,
    currency: string,
    filters: { year?: number; startDate?: string; endDate?: string } = {},
  ) {
    const rows = await this.withUserCurrencyAndDateRange(
      userId,
      currency,
      filters,
    )
      .select('envelope.id', 'envelopeId')
      .addSelect('envelope.name', 'envelopeName')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'spent')
      .addSelect('COUNT(*)', 'expenseCount')
      // Cast to text so pg returns YYYY-MM-DD instead of a server-local Date.
      .addSelect('MIN(expense.date)::text', 'firstExpenseDate')
      .addSelect('MAX(expense.date)::text', 'lastExpenseDate')
      .groupBy('envelope.id')
      .addGroupBy('envelope.name')
      .orderBy('SUM(expense.amount)', 'DESC')
      .getRawMany<{
        envelopeId: string;
        envelopeName: string;
        spent: string;
        expenseCount: string;
        firstExpenseDate: string;
        lastExpenseDate: string;
      }>();

    return rows.map((row) => ({
      envelopeId: row.envelopeId,
      envelopeName: row.envelopeName,
      spent: Number(row.spent),
      expenseCount: Number(row.expenseCount),
      firstExpenseDate: row.firstExpenseDate,
      lastExpenseDate: row.lastExpenseDate,
    }));
  }

  /** Groups case-insensitively by expense name and displays the latest casing. */
  async getNameBreakdown(
    userId: string,
    currency: string,
    filters: { year?: number; startDate?: string; endDate?: string } = {},
  ) {
    const rows = await this.withUserCurrencyAndDateRange(
      userId,
      currency,
      filters,
    )
      .select(
        '(ARRAY_AGG(expense.name ORDER BY expense.date DESC, expense.createdAt DESC))[1]',
        'name',
      )
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'spent')
      .addSelect('COUNT(*)', 'expenseCount')
      .groupBy('LOWER(expense.name)')
      .orderBy('SUM(expense.amount)', 'DESC')
      .getRawMany<{ name: string; spent: string; expenseCount: string }>();

    return rows.map((row) => ({
      name: row.name,
      spent: Number(row.spent),
      expenseCount: Number(row.expenseCount),
    }));
  }

  async getBreakdownTotal(
    userId: string,
    currency: string,
    filters: { year?: number; startDate?: string; endDate?: string } = {},
  ) {
    const row = await this.withUserCurrencyAndDateRange(
      userId,
      currency,
      filters,
    )
      .select('COALESCE(SUM(expense.amount), 0)', 'spent')
      .addSelect('COUNT(*)', 'expenseCount')
      .getRawOne<{ spent: string; expenseCount: string }>();

    return {
      spent: Number(row?.spent ?? 0),
      expenseCount: Number(row?.expenseCount ?? 0),
    };
  }

  /** Per-currency envelope totals; available and exceeded are tracked separately (not netted). */
  async getSummaryAggregate(userId: string) {
    const rows = await this.repository
      .createQueryBuilder('envelope')
      .where('envelope.userId = :userId', { userId })
      .select('envelope.currency', 'currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(envelope.amount), 0)', 'totalAssigned')
      .addSelect('COALESCE(SUM(envelope.spent), 0)', 'totalSpent')
      .addSelect(
        'COALESCE(SUM(CASE WHEN envelope.amount IS NOT NULL THEN envelope.spent ELSE 0 END), 0)',
        'cappedSpent',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN envelope.amount IS NOT NULL THEN GREATEST(envelope.amount - envelope.spent, 0) ELSE 0 END), 0)',
        'totalAvailable',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN envelope.amount IS NOT NULL THEN GREATEST(envelope.spent - envelope.amount, 0) ELSE 0 END), 0)',
        'totalExceeded',
      )
      .groupBy('envelope.currency')
      // Most-used currency first, with alphabetical tie-breaker for deterministic primaryCurrency.
      .orderBy('count', 'DESC')
      .addOrderBy('envelope.currency', 'ASC')
      .getRawMany<SummaryAggregateRow>();

    return rows.map((row) => ({
      currency: row.currency,
      count: Number(row.count),
      totalAssigned: Number(row.totalAssigned),
      totalSpent: Number(row.totalSpent),
      cappedSpent: Number(row.cappedSpent),
      totalAvailable: Number(row.totalAvailable),
      totalExceeded: Number(row.totalExceeded),
    }));
  }

  /** Returns the latest `limit` months of spending by expense date, ordered oldest first. */
  async getMonthlySpending(
    userId: string,
    year: number | undefined,
    limit: number,
    currency: string,
  ) {
    const rows = await this.withUserCurrencyAndDateRange(userId, currency, {
      year,
    })
      .select("TO_CHAR(expense.date, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'spent')
      .groupBy("TO_CHAR(expense.date, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .limit(limit)
      .getRawMany<{ month: string; spent: string }>();

    return rows
      .map((row) => ({ month: row.month, spent: Number(row.spent) }))
      .reverse();
  }

  async getAvailableYears(userId: string): Promise<number[]> {
    const rows = await this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.envelope', 'envelope')
      .select('DISTINCT EXTRACT(YEAR FROM expense.date)', 'year')
      .where('envelope.userId = :userId', { userId })
      .orderBy('year', 'DESC')
      .getRawMany<{ year: string }>();

    return rows.map((row) => Number(row.year));
  }

  async getRecentExpenses(userId: string, limit: number) {
    const rows = await this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.envelope', 'envelope')
      .where('envelope.userId = :userId', { userId })
      .select('expense.id', 'id')
      .addSelect('expense.name', 'name')
      .addSelect('expense.amount', 'amount')
      .addSelect('expense.currency', 'currency')
      // Cast to text so pg returns YYYY-MM-DD instead of a server-local Date.
      .addSelect('expense.date::text', 'date')
      .addSelect('envelope.id', 'envelopeId')
      .addSelect('envelope.name', 'envelopeName')
      .orderBy('expense.date', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .limit(limit)
      .getRawMany<RecentExpenseRow>();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      currency: row.currency,
      date: row.date,
      envelopeId: row.envelopeId,
      envelopeName: row.envelopeName,
    }));
  }
}
