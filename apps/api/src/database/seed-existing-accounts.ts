import { QueryRunner } from 'typeorm';

/**
 * Idempotently copies predefined categories to every existing account and re-points their envelopes.
 * Kept outside `migrations/` because TypeORM instantiates every export in that folder as a migration.
 */
export async function seedExistingAccounts(
  queryRunner: QueryRunner,
): Promise<void> {
  await queryRunner.query(`
    INSERT INTO "category_seed" ("userId")
    SELECT DISTINCT "userId" FROM (
      SELECT "userId" FROM "envelope"
      UNION
      SELECT "userId" FROM "category" WHERE "userId" IS NOT NULL
    ) accounts
    ON CONFLICT DO NOTHING
  `);

  // Preserve template `created_at` so every account lists defaults in the same order.
  await queryRunner.query(`
    INSERT INTO "category" ("userId", "label", "color", "icon", "isDefault", "created_at", "updated_at")
    SELECT s."userId", t."label", t."color", t."icon", true, t."created_at", now()
    FROM "category_seed" s
    CROSS JOIN "category" t
    WHERE t."userId" IS NULL
    ON CONFLICT DO NOTHING
  `);

  await queryRunner.query(`
    UPDATE "envelope" e
    SET "categoryId" = c."id"
    FROM "category" t
    JOIN "category" c ON c."label" = t."label"
    WHERE t."userId" IS NULL
      AND e."categoryId" = t."id"
      AND c."userId" = e."userId"
  `);
}
