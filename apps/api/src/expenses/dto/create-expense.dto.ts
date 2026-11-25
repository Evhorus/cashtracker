import {
  Currency,
  EXPENSE_DESCRIPTION_MAX_LENGTH,
  MAX_AMOUNT,
  type CurrencyCode,
} from '@cashtracker/shared';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

import { ERROR_MESSAGES } from '@/common/constants/error-messages';
import { normalizeString } from '@/common/utils/string-utils';
import { IsCalendarDate } from '@/common/validators/calendar-date.validators';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => normalizeString(value))
  name: string;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: CurrencyCode;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Max(MAX_AMOUNT, { message: ERROR_MESSAGES.AMOUNT_TOO_LARGE })
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(EXPENSE_DESCRIPTION_MAX_LENGTH)
  @Transform(({ value }) => normalizeString(value))
  description?: string;

  @IsNotEmpty()
  @IsCalendarDate()
  date: Date;

  /** Optional. `null` (or '') clears it on an update; omitted leaves it
   * unchanged. Ownership is checked in the service. */
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? null : (value as string | null),
  )
  paymentMethodId?: string | null;
}
