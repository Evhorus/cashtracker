import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

import { ClerkAuthGuard } from './clerk-auth.guard';

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(),
}));

const mockedVerifyToken = vi.mocked(verifyToken);

function makeContext(authorization?: string): {
  context: ExecutionContext;
  request: Partial<Request>;
} {
  const request: Partial<Request> = {
    headers: authorization !== undefined ? { authorization } : {},
  };
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let reflector: { getAllAndOverride: Mock };
  let configService: { getOrThrow: Mock };

  beforeEach(() => {
    vi.clearAllMocks();
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(false) };
    configService = { getOrThrow: vi.fn().mockReturnValue('sk_test_secret') };
    guard = new ClerkAuthGuard(
      reflector as unknown as Reflector,
      configService as unknown as ConfigService,
    );
  });

  it('allows public routes without checking Authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { context } = makeContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('rejects requests without an Authorization header', async () => {
    const { context } = makeContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it.each([
    'Basic dXNlcjpwYXNz',
    'raw-token-without-scheme',
    'Bearer',
    'Bearer token-one token-two',
  ])('rejects malformed Authorization header %p', async (header) => {
    const { context } = makeContext(header);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('verifies a valid Bearer token and attaches req.user', async () => {
    mockedVerifyToken.mockResolvedValue({
      sub: 'user_123',
      sid: 'sess_456',
    } as never);
    const { context, request } = makeContext('Bearer valid.jwt.token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockedVerifyToken).toHaveBeenCalledWith('valid.jwt.token', {
      secretKey: 'sk_test_secret',
    });
    expect(request.user).toEqual({
      id: 'user_123',
      sub: 'user_123',
      sid: 'sess_456',
    });
  });

  it('throws UnauthorizedException when Clerk rejects the token', async () => {
    mockedVerifyToken.mockRejectedValue(new Error('Token expired'));
    const { context } = makeContext('Bearer expired.jwt.token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
