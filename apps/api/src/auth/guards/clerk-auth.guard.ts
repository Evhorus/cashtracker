import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '@/auth/decorators/public.decorator';

const BEARER_HEADER_PATTERN = /^Bearer\s+(\S+)$/i;

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.getOrThrow<string>('CLERK_SECRET_KEY'),
      });

      // Attach the verified JWT claims directly (sub aliased as id) to avoid
      // a network call to Clerk on every request.
      request.user = {
        id: payload.sub,
        ...payload,
      };

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Invalid Clerk token: ${errorMessage}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractBearerToken(header: string | undefined): string | null {
    if (!header) return null;
    const match = BEARER_HEADER_PATTERN.exec(header.trim());
    return match ? match[1] : null;
  }
}
