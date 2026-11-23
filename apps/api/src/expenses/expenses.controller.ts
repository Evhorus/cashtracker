import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetExpensesFilterDto } from './dto/get-expenses-filter.dto';
import { ExpensesService } from './expenses.service';

@Controller('envelopes/:envelopeId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  createExpense(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(userId, envelopeId, createExpenseDto);
  }

  @Get()
  findAllExpenses(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Query() filters: GetExpensesFilterDto,
  ) {
    return this.expensesService.findAll(userId, envelopeId, filters);
  }

  @Get(':expenseId')
  findExpense(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
  ) {
    return this.expensesService.findOne(userId, envelopeId, expenseId);
  }

  @Patch(':expenseId')
  updateExpense(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update({
      userId,
      envelopeId,
      expenseId,
      updateExpenseDto,
    });
  }

  @Delete(':expenseId')
  deleteExpense(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
  ) {
    return this.expensesService.remove(userId, envelopeId, expenseId);
  }
}
