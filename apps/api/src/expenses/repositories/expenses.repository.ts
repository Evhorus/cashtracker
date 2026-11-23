import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { escapeLikePattern } from 'src/common/utils/string-utils';
import { Expense } from '../entities/expense.entity';

interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: 'ASC' | 'DESC';
  sortBy?: 'date' | 'amount';
  paymentMethodIds?: string[];
  includeUnassigned?: boolean;
}

@Injectable()
export class ExpensesRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
  ) {}

  async findInEnvelopeById(
    envelopeId: string,
    id: string,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Expense) : this.repository;
    return repo.findOneBy({ id, envelopeId });
  }

  async findOwnedInEnvelope(
    userId: string,
    envelopeId: string,
    expenseId: string,
  ) {
    return this.repository
      .createQueryBuilder('expense')
      .innerJoin('expense.envelope', 'envelope')
      .leftJoin('expense.paymentMethod', 'paymentMethod')
      .addSelect([
        'paymentMethod.id',
        'paymentMethod.name',
        'paymentMethod.color',
      ])
      .where('expense.id = :expenseId', { expenseId })
      .andWhere('expense.envelopeId = :envelopeId', { envelopeId })
      .andWhere('envelope.userId = :userId', { userId })
      .getOne();
  }

  async create(expenseData: Partial<Expense>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Expense) : this.repository;
    const expense = repo.create(expenseData);
    return repo.save(expense);
  }

  async update(
    id: string,
    expenseData: Partial<Expense>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Expense) : this.repository;
    return repo.update(id, expenseData);
  }

  async delete(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Expense) : this.repository;
    return repo.delete({ id });
  }

  /** Base filter query shared by `findPage` and `getFilteredAggregate` (excludes sort/pagination). */
  private buildFilteredQuery(
    envelopeId: string,
    filters: ExpenseFilters,
  ): SelectQueryBuilder<Expense> {
    const query = this.repository
      .createQueryBuilder('expense')
      .where('expense.envelopeId = :envelopeId', { envelopeId });

    if (filters.startDate) {
      query.andWhere('expense.date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('expense.date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.search) {
      query.andWhere(
        "(LOWER(expense.name) LIKE LOWER(:search) ESCAPE '\\' OR LOWER(expense.description) LIKE LOWER(:search) ESCAPE '\\')",
        { search: `%${escapeLikePattern(filters.search)}%` },
      );
    }

    this.applyPaymentMethodFilter(
      query,
      filters.paymentMethodIds ?? [],
      Boolean(filters.includeUnassigned),
    );

    return query;
  }

  private applyPaymentMethodFilter(
    query: SelectQueryBuilder<Expense>,
    methodIds: string[],
    includeUnassigned: boolean,
  ) {
    if (methodIds.length === 0 && !includeUnassigned) return;

    query.andWhere(
      new Brackets((byMethod) => {
        if (methodIds.length > 0) {
          byMethod.orWhere('expense.paymentMethodId IN (:...methodIds)', {
            methodIds,
          });
        }
        if (includeUnassigned) {
          byMethod.orWhere('expense.paymentMethodId IS NULL');
        }
      }),
    );
  }

  async findPage(
    envelopeId: string,
    filters: ExpenseFilters,
    page: number,
    limit: number,
  ) {
    const query = this.buildFilteredQuery(envelopeId, filters)
      .leftJoin('expense.paymentMethod', 'paymentMethod')
      .addSelect([
        'paymentMethod.id',
        'paymentMethod.name',
        'paymentMethod.color',
      ]);

    const sortOrder = filters.sort || 'DESC';
    if (filters.sortBy === 'amount') {
      query.orderBy('expense.amount', sortOrder);
      query.addOrderBy('expense.date', 'DESC');
    } else {
      query.orderBy('expense.date', sortOrder);
    }
    query.addOrderBy('expense.createdAt', 'DESC');
    // offset/limit avoids TypeORM's DISTINCT subquery since paymentMethod is many-to-one.
    query.offset((page - 1) * limit).limit(limit);

    return query.getMany();
  }

  async getFilteredAggregate(envelopeId: string, filters: ExpenseFilters) {
    const result = await this.buildFilteredQuery(envelopeId, filters)
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'sum')
      .getRawOne<{ count: string; sum: string }>();

    return {
      total: result ? Number(result.count) : 0,
      totalAmount: result ? parseFloat(result.sum) : 0,
    };
  }
}
