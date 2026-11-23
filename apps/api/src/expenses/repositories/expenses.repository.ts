import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
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

  /**
   * Loads one expense scoped to both the envelope and its owner in a
   * single SQL query, selecting only the paymentMethod fields embedded
   * in ExpenseResponseDto.
   */
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

  /**
   * The `envelopeId` + search/date-range conditions shared by `findAll`
   * and `calculateFilteredTotal`. Sorting and pagination are deliberately
   * left out here - they only ever apply to the page of rows being
   * listed, never to the aggregate over the full filtered set.
   */
  private buildFilteredQuery(
    envelopeId: string,
    filters: ExpenseFilters,
  ): SelectQueryBuilder<Expense> {
    const query = this.repository.createQueryBuilder('expense');

    query.where('expense.envelopeId = :envelopeId', { envelopeId });

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
        '(LOWER(expense.name) LIKE LOWER(:search) OR LOWER(expense.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    const methodIds = filters.paymentMethodIds ?? [];
    if (methodIds.length > 0 || filters.includeUnassigned) {
      // Any of the selected methods, or none at all when asked - an OR
      // inside its own brackets so it cannot leak past the envelope
      // condition above.
      query.andWhere(
        new Brackets((byMethod) => {
          if (methodIds.length > 0) {
            byMethod.orWhere('expense.paymentMethodId IN (:...methodIds)', {
              methodIds,
            });
          }
          if (filters.includeUnassigned) {
            byMethod.orWhere('expense.paymentMethodId IS NULL');
          }
        }),
      );
    }

    return query;
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

    // Most recent first by default - the conventional order for a
    // transaction/expense history (what did I just spend, not what did
    // I spend first), and what the frontend's own "Actividad reciente"
    // dashboard widget already assumes for expenses.
    const sortOrder = filters.sort || 'DESC';
    if (filters.sortBy === 'amount') {
      // Ties (same amount) fall back to newest first.
      query.orderBy('expense.amount', sortOrder);
      query.addOrderBy('expense.date', 'DESC');
    } else {
      query.orderBy('expense.date', sortOrder);
    }
    query.addOrderBy('expense.createdAt', 'DESC');
    // offset/limit instead of skip/take: paymentMethod is many-to-one so
    // rows never multiply, avoiding TypeORM's extra DISTINCT sub-query.
    query.offset((page - 1) * limit).limit(limit);

    return query.getMany();
  }

  /**
   * Total count and sum of `amount` over the entire filtered result set
   * in a single aggregate query (replaces separate COUNT + SUM queries).
   */
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
