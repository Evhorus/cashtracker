import { MigrationInterface, QueryRunner } from 'typeorm';

import { seedExistingAccounts } from '../seed-existing-accounts';

/**
 * The 9 predefined categories (userId IS NULL) stop being shared rows that
 * every user sees and become templates: each account gets its own editable
 * copy (see CategoriesRepository.seedDefaultsFor for accounts created
 * later, which are seeded the first time they load categories).
 *
 * Accounts that already exist are seeded here, in one set-based pass,
 * rather than lazily on their next request: that leaves no window in which
 * an envelope still points at a template, and no concurrent request to
 * race the re-pointing. An account is "existing" if it owns an envelope or
 * a category; anything else has nothing to re-point and is seeded on first
 * use like a new one.
 *
 * Adds a bookkeeping table and copies rows; nothing existing is deleted.
 */
export class CreateCategorySeed1794890000000 implements MigrationInterface {
  name = 'CreateCategorySeed1794890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category_seed" ("userId" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_category_seed_userId" PRIMARY KEY ("userId"))`,
    );
    await seedExistingAccounts(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "category_seed"`);
  }
}
