import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '@/auth/decorators/public.decorator';

@SkipThrottle()
@Controller('health-check')
export class HealthCheckController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
