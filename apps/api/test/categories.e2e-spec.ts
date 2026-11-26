import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import {
  type ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from '@/app.module';
import { ClerkAuthGuard } from '@/auth/guards/clerk-auth.guard';
import { seedExistingAccounts } from '@/database/seed-existing-accounts';
import { assertSafeTestDatabase } from './assert-safe-test-database';

interface CategoryBody {
  id: string;
  label: string;
}

/**
 * Every account gets its own copy of the predefined categories the first
 * time it loads them, and from then on they are the user's to rename or
 * delete like any other.
 */
describe('Categories (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const user = { id: 'user_test_categories' };

  beforeAll(async () => {
    assertSafeTestDatabase();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClerkAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = user;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM envelope');
    await dataSource.query('DELETE FROM category WHERE "userId" IS NOT NULL');
    await dataSource.query('DELETE FROM category_seed');
  });

  const list = async () =>
    (await request(app.getHttpServer()).get('/categories').expect(200))
      .body as CategoryBody[];

  it('seeds the user with their own copy of the predefined set', async () => {
    const [{ count: templates }] = await dataSource.query(
      'SELECT COUNT(*)::int AS count FROM category WHERE "userId" IS NULL',
    );

    const categories = await list();

    expect(categories).toHaveLength(templates);
    const owned = await dataSource.query(
      'SELECT id FROM category WHERE "userId" = $1',
      [user.id],
    );
    expect(owned).toHaveLength(templates);
  });

  it('does not duplicate the set on later or simultaneous loads', async () => {
    await Promise.all([list(), list(), list()]);
    const again = await list();

    const [{ count: templates }] = await dataSource.query(
      'SELECT COUNT(*)::int AS count FROM category WHERE "userId" IS NULL',
    );
    expect(again).toHaveLength(templates);
  });

  it('lets the user rename and delete a predefined category', async () => {
    const [first, second] = await list();

    await request(app.getHttpServer())
      .patch(`/categories/${first.id}`)
      .send({ label: 'Mi casa' })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/categories/${first.id}`)
      .send({ label: 'MI CASA' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/categories/${second.id}`)
      .expect(200);

    const after = await list();
    expect(after.map((c) => c.label)).toContain('MI CASA');
    expect(after.map((c) => c.id)).not.toContain(second.id);
  });

  it('returns the created id on POST and rejects case-insensitive duplicates', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .send({
        label: 'Suscripciones',
        color: 'oklch(0.72 0.14 153)',
        icon: 'tag',
      })
      .expect(201);

    expect(created.body).toEqual({
      id: expect.any(String),
      message: 'Categoría creada',
    });

    await request(app.getHttpServer())
      .post('/categories')
      .send({
        label: 'suscripciones',
        color: 'oklch(0.72 0.14 153)',
        icon: 'tag',
      })
      .expect(409);
  });

  it('does not bring deleted categories back', async () => {
    const categories = await list();
    for (const category of categories) {
      await request(app.getHttpServer())
        .delete(`/categories/${category.id}`)
        .expect(200);
    }

    expect(await list()).toEqual([]);
  });

  it('re-points an existing envelope from a template to the user copy', async () => {
    const [{ id: templateId, label }] = await dataSource.query(
      'SELECT id, label FROM category WHERE "userId" IS NULL ORDER BY created_at LIMIT 1',
    );
    await dataSource.query(
      `INSERT INTO envelope (name, amount, currency, spent, "userId", "categoryId")
       VALUES ('Antiguo', 100, 'COP', 0, $1, $2)`,
      [user.id, templateId],
    );

    const categories = await list();
    const copy = categories.find((c) => c.label === label);

    const [envelope] = await dataSource.query(
      'SELECT "categoryId" FROM envelope WHERE "userId" = $1',
      [user.id],
    );
    expect(copy).toBeDefined();
    expect(envelope.categoryId).toBe(copy?.id);
    expect(envelope.categoryId).not.toBe(templateId);
  });

  it('refuses an envelope pointing at a shared template', async () => {
    await list();
    const [{ id: templateId }] = await dataSource.query(
      'SELECT id FROM category WHERE "userId" IS NULL LIMIT 1',
    );

    await request(app.getHttpServer())
      .post('/envelopes')
      .send({
        name: 'X',
        amount: 100,
        currency: 'COP',
        categoryId: templateId,
      })
      .expect(404);
  });

  describe('accounts that existed before the seed', () => {
    const legacy = 'user_test_categories_legacy';

    afterEach(async () => {
      await dataSource.query('DELETE FROM envelope WHERE "userId" = $1', [
        legacy,
      ]);
      await dataSource.query('DELETE FROM category WHERE "userId" = $1', [
        legacy,
      ]);
      await dataSource.query('DELETE FROM category_seed WHERE "userId" = $1', [
        legacy,
      ]);
    });

    it('are seeded by the migration, with their envelopes re-pointed', async () => {
      const [{ id: templateId, label }] = await dataSource.query(
        'SELECT id, label FROM category WHERE "userId" IS NULL ORDER BY created_at, label LIMIT 1',
      );
      await dataSource.query(
        `INSERT INTO envelope (name, amount, currency, spent, "userId", "categoryId")
         VALUES ('Antiguo', 100, 'COP', 0, $1, $2)`,
        [legacy, templateId],
      );

      const queryRunner = dataSource.createQueryRunner();
      try {
        await seedExistingAccounts(queryRunner);
        // Idempotent: a second pass changes nothing.
        await seedExistingAccounts(queryRunner);
      } finally {
        await queryRunner.release();
      }

      const [{ count: templates }] = await dataSource.query(
        'SELECT COUNT(*)::int AS count FROM category WHERE "userId" IS NULL',
      );
      const [{ count: owned }] = await dataSource.query(
        'SELECT COUNT(*)::int AS count FROM category WHERE "userId" = $1',
        [legacy],
      );
      const [envelope] = await dataSource.query(
        `SELECT c.label, c."userId" FROM envelope e JOIN category c ON c.id = e."categoryId" WHERE e."userId" = $1`,
        [legacy],
      );
      expect(owned).toBe(templates);
      expect(envelope).toEqual({ label, userId: legacy });
    });

    it('does not seed an account that owns nothing', async () => {
      const queryRunner = dataSource.createQueryRunner();
      try {
        await seedExistingAccounts(queryRunner);
      } finally {
        await queryRunner.release();
      }

      const rows = await dataSource.query(
        'SELECT 1 FROM category_seed WHERE "userId" = $1',
        ['user_with_nothing'],
      );
      expect(rows).toHaveLength(0);
    });

    it('rejects renaming a category to a name the seed would bring in, differing only by case', async () => {
      // A custom category created before the account's first GET.
      const [{ id }] = await dataSource.query(
        `INSERT INTO category ("userId", label, color, icon, "isDefault")
         VALUES ($1, 'Mi cosa', 'oklch(0.7 0.13 30)', 'tag', false) RETURNING id`,
        [user.id],
      );

      await request(app.getHttpServer())
        .patch(`/categories/${id}`)
        .send({ label: 'hogar' })
        .expect(409);
    });
  });
});
