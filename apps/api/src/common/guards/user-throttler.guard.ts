import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

// Keys rate limits on the authenticated Clerk user (all browser traffic shares
// the Next.js server IP), falling back to normalized IP for public routes.
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request;
    if (request.user?.id) {
      return Promise.resolve(`user:${request.user.id}`);
    }
    return super.getTracker(req);
  }
}
