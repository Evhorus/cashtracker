import { Envelope } from '@/envelopes/entities/envelope.entity';
import {
  deriveEnvelopeStatus,
  type EnvelopeProgressStatus,
} from '@/envelopes/utils/envelope-status';
import { EnvelopeCategoryDto } from './envelope-category.dto';

export class EnvelopeResponseDto {
  id: string;
  name: string;
  amount: number | null;
  currency: string;
  spent: number;
  status: EnvelopeProgressStatus;
  category: EnvelopeCategoryDto | null;
  description?: string;
  /** Earliest and latest expense dates (`YYYY-MM-DD`), or `null` when empty. */
  firstExpenseDate: string | null;
  lastExpenseDate: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    envelope: Envelope,
    expenseDates?: { first: string; last: string },
  ): EnvelopeResponseDto {
    return {
      id: envelope.id,
      name: envelope.name,
      amount: envelope.amount,
      currency: envelope.currency,
      spent: envelope.spent,
      status: deriveEnvelopeStatus(envelope.amount, envelope.spent),
      category: EnvelopeCategoryDto.fromEntity(envelope.category),
      description: envelope.description,
      firstExpenseDate: expenseDates?.first ?? null,
      lastExpenseDate: expenseDates?.last ?? null,
      createdAt: envelope.createdAt,
      updatedAt: envelope.updatedAt,
    };
  }
}
