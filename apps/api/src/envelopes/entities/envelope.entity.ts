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
// eslint-disable-next-line import/no-cycle -- TypeORM bidirectional relation, references stay lazy (see root AGENTS.md)
import { Expense } from '@/expenses/entities/expense.entity';

@Entity()
export class Envelope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  spent: number;

  @Column()
  @Index()
  userId: string;

  // `SET NULL` on delete so an envelope outlives a deleted category as unclassified.
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  categoryId?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Expense, (expense) => expense.envelope, {
    cascade: true,
  })
  expenses: Expense[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
