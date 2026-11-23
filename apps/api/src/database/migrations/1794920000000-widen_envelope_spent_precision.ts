import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenEnvelopeSpentPrecision1794920000000 implements MigrationInterface {
  name = 'WidenEnvelopeSpentPrecision1794920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "envelope" ALTER COLUMN "spent" TYPE numeric(14,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "envelope" ALTER COLUMN "spent" TYPE numeric(12,2)`,
    );
  }
}
