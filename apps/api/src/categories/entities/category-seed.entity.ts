import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * One row per user whose copy of the predefined categories has been made.
 * It is what makes the seed run exactly once: deleting every category
 * later must not bring them back, so "has no categories" cannot be the
 * test. The primary key is also the lock that makes two simultaneous
 * first requests safe (see CategoriesRepository.seedDefaultsFor).
 */
@Entity()
export class CategorySeed {
  @PrimaryColumn({ type: 'varchar' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
