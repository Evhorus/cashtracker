import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
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
    DatabaseModule,
    EnvelopesModule,
    ExpensesModule,
    DashboardModule,
    CategoriesModule,
    PaymentMethodsModule,
    HealthCheckModule,
    AuthModule,
  ],
})
export class AppModule {}
