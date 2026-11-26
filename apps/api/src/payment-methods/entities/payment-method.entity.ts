import type { PaymentMethodType } from '@cashtracker/shared';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check(
  'CHK_payment_method_cutDay',
  '"cutDay" IS NULL OR ("cutDay" BETWEEN 1 AND 31)',
)
// ("userId", LOWER("name")): an expression index, owned by migrations.
@Index('UQ_payment_method_userId_name', { synchronize: false })
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: PaymentMethodType;

  @Column()
  color: string;

  /** Statement closing day of month (credit cards only). */
  @Column({ type: 'smallint', nullable: true })
  cutDay: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
