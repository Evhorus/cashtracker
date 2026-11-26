import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { migrations } from './index';

describe('migrations index', () => {
  it('lists every migration file in the folder', () => {
    const migrationFiles = readdirSync(__dirname).filter((file) =>
      /^\d+-.+\.ts$/.test(file),
    );

    expect(migrations).toHaveLength(migrationFiles.length);
  });

  it('keeps the migrations ordered by timestamp', () => {
    const timestamps = migrations.map(({ name }) =>
      Number(name.match(/\d+$/)?.[0]),
    );

    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });
});
