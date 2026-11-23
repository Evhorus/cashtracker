import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  /**
   * Idempotently copies predefined templates into the user's namespace once.
   * `category_seed` PK serializes concurrent first requests and prevents
   * re-seeding if the user later deletes all default categories.
   */
  async seedDefaultsFor(userId: string): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const claimed = await manager.query<unknown[]>(
        `INSERT INTO "category_seed" ("userId") VALUES ($1) ON CONFLICT DO NOTHING RETURNING "userId"`,
        [userId],
      );
      if (claimed.length === 0) return;

      await manager.query(
        `INSERT INTO "category" ("userId", "label", "color", "icon", "isDefault", "created_at", "updated_at")
         SELECT $1, t."label", t."color", t."icon", true, t."created_at", now()
         FROM "category" t
         WHERE t."userId" IS NULL
         ON CONFLICT DO NOTHING`,
        [userId],
      );

      // Re-point any envelope still referencing a shared template to the user's copy.
      await manager.query(
        `UPDATE "envelope" e
         SET "categoryId" = c."id"
         FROM "category" t
         JOIN "category" c
           ON c."userId" = $1
          AND LOWER(c."label") = LOWER(t."label")
         WHERE t."userId" IS NULL
           AND e."userId" = $1
           AND e."categoryId" = t."id"`,
        [userId],
      );
    });
  }

  async hasBeenSeeded(userId: string): Promise<boolean> {
    const rows = await this.repository.manager.query<unknown[]>(
      `SELECT 1 FROM "category_seed" WHERE "userId" = $1`,
      [userId],
    );
    return rows.length > 0;
  }

  async findAllOwned(userId: string) {
    return this.repository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC', label: 'ASC' },
    });
  }

  /** Counts envelopes per category across all currencies (omits zero-count categories). */
  async countEnvelopesByCategory(userId: string) {
    const rows = await this.repository.manager
      .createQueryBuilder()
      .select('envelope.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'envelopeCount')
      .from('envelope', 'envelope')
      .where('envelope.userId = :userId', { userId })
      .andWhere('envelope.categoryId IS NOT NULL')
      .groupBy('envelope.categoryId')
      .getRawMany<{ categoryId: string; envelopeCount: string }>();

    return rows.map((row) => ({
      categoryId: row.categoryId,
      envelopeCount: Number(row.envelopeCount),
    }));
  }

  async findOwnedById(userId: string, id: string) {
    return this.repository.findOneBy({ id, userId });
  }

  async findOwnedByLabel(userId: string, label: string) {
    return this.repository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('LOWER(category.label) = LOWER(:label)', { label })
      .getOne();
  }

  async create(categoryData: Partial<Category>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    const category = repo.create(categoryData);
    return repo.save(category);
  }

  async update(
    id: string,
    categoryData: Partial<Category>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    return repo.update(id, categoryData);
  }

  async remove(category: Category, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    return repo.remove(category);
  }
}
