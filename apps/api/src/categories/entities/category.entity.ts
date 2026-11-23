import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
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
