import { QueryRunner } from 'typeorm';

/**
 * Gives every existing account its own copy of the predefined categories
 * and re-points its envelopes to them. Used by the CreateCategorySeed
 * migration.
 *
 * It lives outside `migrations/` on purpose: TypeORM treats every export
 * of a file in that folder as a migration class and instantiates it, so a
 * function exported next to the class breaks the boot ("someClass is not
 * a constructor"). It is also exported so the e2e suite can run it against
 * crafted data - migrations only run on an empty database there, which has
 * no accounts to seed. Idempotent: an account already seeded is left alone.
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

  // Same label, colour, icon and creation time as the template, so every
  // account lists them in the template order. A label the account already
  // has keeps its own row (unique on userId + label).
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
