import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

const KEEP_ALIVE_TIMEOUT_MS = 5000;

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(private readonly configService: ConfigService) {}

  /** Self-pings the public URL every 5 min in production to prevent Render free-tier hibernation. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async keepAlive() {
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      return;
    }

    const url = `${this.configService.getOrThrow<string>('API_URL')}/health-check`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(KEEP_ALIVE_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }

      this.logger.log('✓ Self HTTP ping successful');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `✗ Keep-alive ping failed: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
