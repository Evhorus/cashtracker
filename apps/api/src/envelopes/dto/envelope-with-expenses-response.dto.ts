import { ExpenseResponseDto } from '../../expenses/dto/expense-response.dto';
import { Envelope } from '../entities/envelope.entity';
import {
  deriveEnvelopeStatus,
  type EnvelopeProgressStatus,
} from '../utils/envelope-status';
import { EnvelopeCategoryDto } from './envelope-category.dto';

export class EnvelopeWithExpensesResponseDto {
  id: string;
  name: string;
  amount: number | null;
  currency: string;
  spent: number;
  status: EnvelopeProgressStatus;
  category: EnvelopeCategoryDto | null;
  description?: string;
  expenses: ExpenseResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(envelope: Envelope): EnvelopeWithExpensesResponseDto {
    return {
      id: envelope.id,
      name: envelope.name,
      amount: envelope.amount,
      currency: envelope.currency,
      spent: envelope.spent,
      status: deriveEnvelopeStatus(envelope.amount, envelope.spent),
      category: EnvelopeCategoryDto.fromEntity(envelope.category),
      description: envelope.description,
      expenses: envelope.expenses
        ? ExpenseResponseDto.fromEntities(envelope.expenses)
        : [],
      createdAt: envelope.createdAt,
      updatedAt: envelope.updatedAt,
    };
  }
}
