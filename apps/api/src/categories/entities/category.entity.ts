import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index('UQ_category_global_label', ['label'], {
  unique: true,
  where: '"userId" IS NULL',
})
// ("userId", LOWER("label")) WHERE "userId" IS NOT NULL: an expression index, owned by migrations.
@Index('UQ_category_userId_label', { synchronize: false })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NULL only on the 9 predefined template rows copied to each user on first load.
  @Column({ nullable: true, type: 'varchar' })
  userId: string | null;

  @Column()
  label: string;

  @Column()
  color: string;

  @Column()
  icon: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
