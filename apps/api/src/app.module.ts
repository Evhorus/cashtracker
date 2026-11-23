import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { ClerkAuthGuard } from './auth/guards/clerk-auth.guard';
import { CategoriesModule } from './categories/categories.module';
import { UserThrottlerGuard } from './common/guards/user-throttler.guard';
import { AppConfigModule } from './config/app-config.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { EnvelopesModule } from './envelopes/envelopes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        skipIf: () => configService.get<string>('NODE_ENV') === 'test',
        throttlers: [
          { name: 'short', ttl: 1_000, limit: 20 },
          { name: 'medium', ttl: 60_000, limit: 120 },
        ],
      }),
    }),
    DatabaseModule,
    EnvelopesModule,
    ExpensesModule,
    DashboardModule,
    CategoriesModule,
    PaymentMethodsModule,
    HealthCheckModule,
    AuthModule,
  ],
  providers: [
    // Guard order matters: ClerkAuthGuard populates req.user before throttling keys on it.
    {
      provide: APP_GUARD,
      useExisting: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
  ],
})
export class AppModule {}
