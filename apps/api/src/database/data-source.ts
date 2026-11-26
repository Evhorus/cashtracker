import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { CategorySeed } from '@/categories/entities/category-seed.entity';
import { Category } from '@/categories/entities/category.entity';
import { Envelope } from '@/envelopes/entities/envelope.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { PaymentMethod } from '@/payment-methods/entities/payment-method.entity';
import { migrations } from './migrations';

// Must match app-config.module.ts: this module evaluates at import time before ConfigModule.
const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: envFilePath });

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL is not set (loaded ${envFilePath}). ` +
      (process.env.NODE_ENV === 'test'
        ? 'Create a .env.test pointing at a DEDICATED test database - the e2e ' +
          'suites delete rows between tests. It is gitignored.'
        : 'Copy .env.template to .env and fill it in.'),
  );
}

const dbUrl = new URL(process.env.DATABASE_URL);
const currentSslMode = dbUrl.searchParams.get('sslmode');
const WEAK_SSL_ALIASES = new Set(['require', 'prefer', 'verify-ca']);

// Enforce strict TLS in production (upgrading weak pg-connection-string aliases); default off locally.
if (!currentSslMode) {
  dbUrl.searchParams.set('sslmode', isProduction ? 'verify-full' : 'disable');
} else if (isProduction && WEAK_SSL_ALIASES.has(currentSslMode)) {
  dbUrl.searchParams.set('sslmode', 'verify-full');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: dbUrl.toString(),
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  // Classes, not globs, so the app, the TypeORM CLI and the tests share one copy of each entity.
  entities: [Category, CategorySeed, Envelope, Expense, PaymentMethod],
  migrations,
  // Set MIGRATIONS_RUN_ON_BOOT=false and run migrations as a release step when scaling past 1 replica.
  migrationsRun: process.env.MIGRATIONS_RUN_ON_BOOT !== 'false',
  subscribers: [],
  poolSize: 10,
  extra: {
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 15_000,
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);
