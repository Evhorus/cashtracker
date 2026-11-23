import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** Marks users whose default categories were seeded once (PK prevents re-seeding or concurrent duplicates). */
@Entity()
export class CategorySeed {
  @PrimaryColumn({ type: 'varchar' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
