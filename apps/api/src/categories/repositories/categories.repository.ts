import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

/**
 * Custom repository for Category entity
 * Encapsulates complex queries and data access logic
 */
@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  /**
   * Gives a user their own copy of the predefined categories, once.
   *
   * The `category_seed` insert is both the "already done" check and the
   * lock: its primary key makes a second concurrent transaction wait for
   * the first to commit and then insert nothing, so two simultaneous
   * first requests cannot duplicate the set. It is a marker rather than
   * "the user has no categories" so that someone who deletes them all
   * does not get them back.
   *
   * Envelopes that still point at a shared template (every account that
   * existed before this change) are re-pointed to the user's copy, so no
   * envelope loses its category.
   */
  async seedDefaultsFor(userId: string): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const claimed = await manager.query<unknown[]>(
        `INSERT INTO "category_seed" ("userId") VALUES ($1) ON CONFLICT DO NOTHING RETURNING "userId"`,
        [userId],
      );
      if (claimed.length === 0) return;

      // Copy every shared template into the user's own namespace in one
      // statement; any label the user already owns (case-insensitively)
      // keeps their row via UQ_category_userId_label.
      await manager.query(
        `INSERT INTO "category" ("userId", "label", "color", "icon", "isDefault", "created_at", "updated_at")
         SELECT $1, t."label", t."color", t."icon", true, t."created_at", now()
         FROM "category" t
         WHERE t."userId" IS NULL
         ON CONFLICT DO NOTHING`,
        [userId],
      );

      // Re-point any envelope still referencing a shared template to the
      // user's matching row in a single set-based update.
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

  /**
   * Every category the user owns - their copies of the predefined ones
   * and whatever they added. The shared templates (userId NULL) are never
   * returned. Seeded copies first, in template order, then the rest
   * oldest-first - a stable order for the picker.
   */
  async findAllOwned(userId: string) {
    return this.repository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC', label: 'ASC' },
    });
  }

  /**
   * How many envelopes this user has in each category. One row per
   * category they actually use - categories with none are simply absent,
   * and the caller treats a missing entry as zero.
   *
   * Counts across every currency and regardless of spend, which is why
   * this is not the dashboard's category breakdown: that one is scoped
   * to a currency and skips envelopes with nothing spent, because it
   * answers "where did the money go" rather than "how is this classified".
   *
   * Its own endpoint rather than a field on GET /categories: the
   * dashboard layout fetches that list on every page to populate the
   * category picker, and it has no use for counts - making it join and
   * group every time would be a cost paid app-wide for one page.
   */
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

  /**
   * One category by id, only if this user owns it. Envelopes reference
   * categories by id, so this is what stops a well-formed uuid belonging
   * to someone else (or a shared template) from being attached to one.
   */
  async findOwnedById(userId: string, id: string) {
    return this.repository.findOneBy({ id, userId });
  }

  /** Case-insensitive, among the user's own categories. */
  async findOwnedByLabel(userId: string, label: string) {
    return this.repository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('LOWER(category.label) = LOWER(:label)', { label })
      .getOne();
  }

  /**
   * Create a new category
   */
  async create(categoryData: Partial<Category>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    const category = repo.create(categoryData);
    return repo.save(category);
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    categoryData: Partial<Category>,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    return repo.update(id, categoryData);
  }

  /**
   * Remove a category
   */
  async remove(category: Category, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Category) : this.repository;
    return repo.remove(category);
  }
}
