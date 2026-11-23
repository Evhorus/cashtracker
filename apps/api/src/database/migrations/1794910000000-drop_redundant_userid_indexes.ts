import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Drops single-column userId indexes that are already covered by the
 * composite leading-column unique indexes UQ_category_userId_label and
 * UQ_payment_method_userId_name.
 */
export class DropRedundantUseridIndexes1794910000000 implements MigrationInterface {
  name = 'DropRedundantUseridIndexes1794910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_category_userId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_payment_method_userId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_method_userId" ON "payment_method" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_category_userId" ON "category" ("userId")`,
    );
  }
}
