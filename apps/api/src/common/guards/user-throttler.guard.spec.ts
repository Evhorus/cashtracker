import { Controller, Get, type ExecutionContext } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import {
  ThrottlerException,
  ThrottlerModule,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import type { Request } from 'express';
import request from 'supertest';

import { UserThrottlerGuard } from './user-throttler.guard';

function makeContext(req: Record<string, unknown>): ExecutionContext {
  const res = { header: jest.fn() };
  return {
    getHandler: () => function handler() {},
    getClass: () => class DummyController {},
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

describe('UserThrottlerGuard', () => {
  let guard: UserThrottlerGuard;
  let storage: ThrottlerStorageService;

  beforeEach(async () => {
    storage = new ThrottlerStorageService();
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    guard = new UserThrottlerGuard(
      { throttlers: [{ name: 'short', ttl: 60_000, limit: 2 }] },
      storage,
      reflector,
    );
    await guard.onModuleInit();
  });

  afterEach(() => {
    storage.onApplicationShutdown();
  });

  it('tracks authenticated users independently even when sharing one IP', async () => {
    const userAContext = makeContext({
      ip: '10.0.0.1',
      user: { id: 'user_a' },
      headers: {},
    });
    const userBContext = makeContext({
      ip: '10.0.0.1',
      user: { id: 'user_b' },
      headers: {},
    });

    await expect(guard.canActivate(userAContext)).resolves.toBe(true);
    await expect(guard.canActivate(userAContext)).resolves.toBe(true);
    await expect(guard.canActivate(userAContext)).rejects.toThrow(
      ThrottlerException,
    );

    // User B on the same proxy IP still has a fresh quota.
    await expect(guard.canActivate(userBContext)).resolves.toBe(true);
  });

  it('falls back to IP tracking when req.user is absent', async () => {
    const ipAContext = makeContext({ ip: '192.168.1.10', headers: {} });
    const ipBContext = makeContext({ ip: '192.168.1.11', headers: {} });

    await expect(guard.canActivate(ipAContext)).resolves.toBe(true);
    await expect(guard.canActivate(ipAContext)).resolves.toBe(true);
    await expect(guard.canActivate(ipAContext)).rejects.toThrow(
      ThrottlerException,
    );

    await expect(guard.canActivate(ipBContext)).resolves.toBe(true);
  });

  it('runs after an auth APP_GUARD registered before it and enforces 429', async () => {
    @Controller('ping')
    class PingController {
      @Get()
      ping() {
        return { ok: true };
      }
    }

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1 }])],
      controllers: [PingController],
      providers: [
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: (ctx: ExecutionContext) => {
              const req = ctx.switchToHttp().getRequest<Request>();
              const userId = String(req.headers['x-test-user']);
              req.user = { id: userId, sub: userId };
              return true;
            },
          },
        },
        {
          provide: APP_GUARD,
          useClass: UserThrottlerGuard,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    try {
      await request(app.getHttpServer())
        .get('/ping')
        .set('x-test-user', 'user_1')
        .expect(200);
      await request(app.getHttpServer())
        .get('/ping')
        .set('x-test-user', 'user_1')
        .expect(429);
      await request(app.getHttpServer())
        .get('/ping')
        .set('x-test-user', 'user_2')
        .expect(200);
    } finally {
      await app.close();
    }
  });
});
