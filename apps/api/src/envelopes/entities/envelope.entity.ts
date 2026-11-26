import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '@/categories/entities/category.entity';
import type { Expense } from '@/expenses/entities/expense.entity';

@Entity()
export class Envelope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'COP' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  spent: number;

  // Generated name kept from when the table was called "budget".
  @Column()
  @Index('IDX_8ed65c868c97a5fb471d85efb0')
  userId: string;

  // `SET NULL` on delete so an envelope outlives a deleted category as unclassified.
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'categoryId',
    foreignKeyConstraintName: 'FK_envelope_category',
  })
  category?: Category | null;

  @Column({ type: 'uuid', nullable: true })
  @Index('IDX_envelope_categoryId')
  categoryId?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany('Expense', (expense: Expense) => expense.envelope, {
    cascade: true,
  })
  expenses: Expense[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
