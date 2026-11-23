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

  // The owner. NULL only on the 9 predefined rows, which are templates:
  // never shown or used directly, copied to each user the first time they
  // load categories (see CategoriesRepository.seedDefaultsFor). Only ever
  // set by CategoriesService.create, never by an update - a category's
  // ownership doesn't change after creation.
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
