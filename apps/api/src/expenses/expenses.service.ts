import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { ERROR_MESSAGES } from '@/common/constants/error-messages';
import { Envelope } from '@/envelopes/entities/envelope.entity';
import { EnvelopesRepository } from '@/envelopes/repositories/envelopes.repository';
import { PaymentMethodsRepository } from '../payment-methods/repositories/payment-methods.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ExpensesPaginatedResponseDto } from './dto/expenses-paginated-response.dto';
import { GetExpensesFilterDto } from './dto/get-expenses-filter.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesRepository } from './repositories/expenses.repository';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly envelopesRepository: EnvelopesRepository,
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async lockOwnedEnvelope(
    userId: string,
    envelopeId: string,
    manager: EntityManager,
  ) {
    const envelope = await this.envelopesRepository.findOwnedByIdForUpdate(
      userId,
      envelopeId,
      manager,
    );

    if (!envelope) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return envelope;
  }

  private assertSameCurrency(envelope: Envelope, currency?: string) {
    if (currency !== undefined && currency !== envelope.currency) {
      throw new BadRequestException(ERROR_MESSAGES.EXPENSE_CURRENCY_MISMATCH);
    }
  }

  private async findExpenseInEnvelope(
    envelopeId: string,
    expenseId: string,
    manager: EntityManager,
  ) {
    const expense = await this.expensesRepository.findInEnvelopeById(
      envelopeId,
      expenseId,
      manager,
    );

    if (!expense) {
      throw new NotFoundException(ERROR_MESSAGES.EXPENSE_NOT_FOUND);
    }

    return expense;
  }

  private async assertPaymentMethodIsUsable(
    userId: string,
    paymentMethodId: string | null | undefined,
    manager: EntityManager,
  ) {
    if (!paymentMethodId) return;
    const method = await this.paymentMethodsRepository.findForUserById(
      userId,
      paymentMethodId,
      manager,
    );
    if (!method) {
      throw new NotFoundException(ERROR_MESSAGES.PAYMENT_METHOD_NOT_FOUND);
    }
  }

  async create(
    userId: string,
    envelopeId: string,
    createExpenseDto: CreateExpenseDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const envelope = await this.lockOwnedEnvelope(
        userId,
        envelopeId,
        manager,
      );
      this.assertSameCurrency(envelope, createExpenseDto.currency);
      await this.assertPaymentMethodIsUsable(
        userId,
        createExpenseDto.paymentMethodId,
        manager,
      );

      await this.expensesRepository.create(
        { ...createExpenseDto, envelopeId },
        manager,
      );
      await this.envelopesRepository.recalculateSpent(envelopeId, manager);

      return { message: 'Gasto creado' };
    });
  }

  async findAll(
    userId: string,
    envelopeId: string,
    filters: GetExpensesFilterDto,
  ) {
    const { page, limit, ...rest } = filters;
    const [envelopeExists, expenses, aggregate] = await Promise.all([
      this.envelopesRepository.existsOwnedById(userId, envelopeId),
      this.expensesRepository.findPage(envelopeId, rest, page, limit),
      this.expensesRepository.getFilteredAggregate(envelopeId, rest),
    ]);

    if (!envelopeExists) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return new ExpensesPaginatedResponseDto(
      expenses.map((expense) => ExpenseResponseDto.fromEntity(expense)),
      aggregate.total,
      page,
      limit,
      aggregate.totalAmount,
    );
  }

  async findOne(userId: string, envelopeId: string, expenseId: string) {
    const expense = await this.expensesRepository.findOwnedInEnvelope(
      userId,
      envelopeId,
      expenseId,
    );

    if (!expense) {
      throw new NotFoundException(ERROR_MESSAGES.EXPENSE_NOT_FOUND);
    }

    return ExpenseResponseDto.fromEntity(expense);
  }

  async update({
    userId,
    envelopeId,
    expenseId,
    updateExpenseDto,
  }: {
    userId: string;
    envelopeId: string;
    expenseId: string;
    updateExpenseDto: UpdateExpenseDto;
  }) {
    return this.dataSource.transaction(async (manager) => {
      const lockedEnvelope = await this.lockOwnedEnvelope(
        userId,
        envelopeId,
        manager,
      );
      this.assertSameCurrency(lockedEnvelope, updateExpenseDto.currency);
      await this.assertPaymentMethodIsUsable(
        userId,
        updateExpenseDto.paymentMethodId,
        manager,
      );
      await this.findExpenseInEnvelope(envelopeId, expenseId, manager);

      await this.expensesRepository.update(
        expenseId,
        updateExpenseDto,
        manager,
      );
      await this.envelopesRepository.recalculateSpent(envelopeId, manager);

      return { message: 'Gasto actualizado' };
    });
  }

  async remove(userId: string, envelopeId: string, expenseId: string) {
    return this.dataSource.transaction(async (manager) => {
      await this.lockOwnedEnvelope(userId, envelopeId, manager);
      await this.findExpenseInEnvelope(envelopeId, expenseId, manager);

      await this.expensesRepository.delete(expenseId, manager);
      await this.envelopesRepository.recalculateSpent(envelopeId, manager);

      return { message: 'Gasto eliminado' };
    });
  }
}
