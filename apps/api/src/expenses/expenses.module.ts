import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvelopesModule } from '../envelopes/envelopes.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { Expense } from './entities/expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpensesRepository } from './repositories/expenses.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    EnvelopesModule, // Import EnvelopesModule to use its services/repositories
    PaymentMethodsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
  exports: [ExpensesService],
})
export class ExpensesModule {}
