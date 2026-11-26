import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Envelope } from '@/envelopes/entities/envelope.entity';
import { PaymentMethod } from '@/payment-methods/entities/payment-method.entity';

@Entity()
// ("envelopeId", "date" DESC, "created_at" DESC): @Index cannot express DESC, so migrations own it.
@Index('IDX_expense_envelopeId_date_created', { synchronize: false })
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'COP' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne('Envelope', (envelope: Envelope) => envelope.expenses, {
    onDelete: 'CASCADE',
  })
  // Generated name kept from when the table was called "budget".
  @JoinColumn({
    name: 'envelopeId',
    foreignKeyConstraintName: 'FK_a09e4ae0273f63ed09f9eae0a30',
  })
  envelope: Envelope | null;

  @Column()
  envelopeId: string;

  /** What it was paid with - optional; `SET NULL` when the payment
   * method is deleted, so the expense itself is never lost. */
  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'paymentMethodId',
    foreignKeyConstraintName: 'FK_expense_paymentMethodId',
  })
  paymentMethod?: PaymentMethod | null;

  @Column({ type: 'uuid', nullable: true })
  @Index('IDX_expense_paymentMethodId')
  paymentMethodId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
