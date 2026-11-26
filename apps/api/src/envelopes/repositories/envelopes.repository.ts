import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { escapeLikePattern } from '@/common/utils/string-utils';
import { Expense } from '@/expenses/entities/expense.entity';
import type { EnvelopeSort } from '@/envelopes/dto/get-envelopes-filter.dto';
import { Envelope } from '@/envelopes/entities/envelope.entity';
import {
  buildEnvelopeStatusPredicate,
  type EnvelopeStatusFilter,
} from '@/envelopes/utils/envelope-status';

export interface EnvelopeListFilters {
  search?: string;
  status?: EnvelopeStatusFilter;
  sort?: EnvelopeSort;
}

@Injectable()
export class EnvelopesRepository {
  constructor(
    @InjectRepository(Envelope)
    private readonly repository: Repository<Envelope>,
  ) {}

  async findByUserIdLight(
    userId: string,
    page: number,
    limit: number,
    filters: EnvelopeListFilters = {},
  ) {
    const query = this.repository
      .createQueryBuilder('envelope')
      .where('envelope.userId = :userId', { userId })
      .leftJoin('envelope.category', 'category')
      .select([
        'envelope.id',
        'envelope.name',
        'envelope.amount',
        'envelope.currency',
        'envelope.spent',
        'envelope.description',
        'envelope.createdAt',
        'envelope.updatedAt',
        'category.id',
        'category.label',
        'category.color',
        'category.icon',
      ]);

    if (filters.search) {
      query.andWhere(
        "(LOWER(envelope.name) LIKE LOWER(:search) ESCAPE '\\' OR LOWER(category.label) LIKE LOWER(:search) ESCAPE '\\')",
        { search: `%${escapeLikePattern(filters.search)}%` },
      );
    }

    const statusPredicate = filters.status
      ? buildEnvelopeStatusPredicate(filters.status)
      : null;
    if (statusPredicate) {
      query.andWhere(`(${statusPredicate.clause})`, statusPredicate.params);
    }

    const direction = filters.sort === 'oldest' ? 'ASC' : 'DESC';
    query.addSelect(
      `COALESCE((SELECT MAX(expense.date) FROM expense WHERE expense."envelopeId" = envelope.id), envelope.created_at::date)`,
      'period_end',
    );
    query.orderBy('period_end', direction);
    query.addOrderBy('envelope.createdAt', direction);
    // Use offset/limit because the only join is many-to-one and skip/take cannot order by a computed column.
    query.offset((page - 1) * limit).limit(limit);

    return query.getManyAndCount();
  }

  /** Returns `YYYY-MM-DD` expense date bounds per envelope (`::text` avoids pg Date coercion). */
  async findExpenseDateRanges(
    envelopeIds: string[],
  ): Promise<Map<string, { first: string; last: string }>> {
    if (envelopeIds.length === 0) return new Map();
    const rows = await this.repository.manager
      .createQueryBuilder(Expense, 'expense')
      .select('expense.envelopeId', 'envelopeId')
      .addSelect('MIN(expense.date)::text', 'first')
      .addSelect('MAX(expense.date)::text', 'last')
      .where('expense.envelopeId IN (:...envelopeIds)', { envelopeIds })
      .groupBy('expense.envelopeId')
      .getRawMany<{ envelopeId: string; first: string; last: string }>();
    return new Map(
      rows.map((row) => [row.envelopeId, { first: row.first, last: row.last }]),
    );
  }

  async findOwnedById(userId: string, id: string) {
    return this.repository.findOneBy({ id, userId });
  }

  async existsOwnedById(userId: string, id: string) {
    return this.repository.existsBy({ id, userId });
  }

  async findOwnedByIdWithExpenses(userId: string, id: string) {
    return this.repository
      .createQueryBuilder('envelope')
      .leftJoinAndSelect('envelope.category', 'category')
      .leftJoinAndSelect('envelope.expenses', 'expense')
      .leftJoin('expense.paymentMethod', 'paymentMethod')
      .addSelect([
        'paymentMethod.id',
        'paymentMethod.name',
        'paymentMethod.color',
      ])
      .where('envelope.id = :id', { id })
      .andWhere('envelope.userId = :userId', { userId })
      .orderBy('expense.date', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .getOne();
  }

  async create(envelopeData: Partial<Envelope>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Envelope) : this.repository;
    const envelope = repo.create(envelopeData);
    return repo.save(envelope);
  }

  async update(
    id: string,
    envelopeData: Partial<Envelope>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Envelope) : this.repository;
    return repo.update(id, envelopeData);
  }

  async remove(envelope: Envelope, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Envelope) : this.repository;
    return repo.remove(envelope);
  }

  /** Acquires a `SELECT ... FOR UPDATE` row lock to serialize concurrent expense/currency writes. */
  async findOwnedByIdForUpdate(
    userId: string,
    id: string,
    manager: EntityManager,
  ) {
    return manager.getRepository(Envelope).findOne({
      where: { id, userId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  /** Recomputes stored `spent` from expense rows to prevent incremental drift. */
  async recalculateSpent(id: string, manager: EntityManager) {
    await manager.query(
      `UPDATE envelope
         SET spent = (
           SELECT COALESCE(SUM(amount), 0) FROM expense WHERE "envelopeId" = $1
         )
       WHERE id = $1`,
      [id],
    );
  }

  async hasExpenses(id: string, manager?: EntityManager) {
    const queryManager = manager ?? this.repository.manager;
    return queryManager.exists(Expense, {
      where: { envelopeId: id },
    });
  }
}
