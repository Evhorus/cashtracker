import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the missing composite index on expense("envelopeId", "date", "created_at")
 * and upgrades category's per-user unique index to be case-insensitive so
 * concurrent requests cannot insert case-duplicate labels.
 */
export class AuditBlock1Indexes1794900000000 implements MigrationInterface {
  name = 'AuditBlock1Indexes1794900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_expense_envelopeId_date_created" ON "expense" ("envelopeId", "date" DESC, "created_at" DESC)`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_category_userId_label"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_category_userId_label" ON "category" ("userId", LOWER("label")) WHERE "userId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_category_userId_label"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_category_userId_label" ON "category" ("userId", "label")`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_expense_envelopeId_date_created"`,
    );
  }
}
