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

import { MAX_AMOUNT } from 'src/common/constants/amounts';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages';
import { Currency } from 'src/common/enums/currency.enum';
import { normalizeString } from 'src/common/utils/string-utils';

export class CreateEnvelopeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => normalizeString(value))
  name: string;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Max(MAX_AMOUNT, { message: ERROR_MESSAGES.AMOUNT_TOO_LARGE })
  amount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => normalizeString(value))
  description?: string;

  /** `null` clears the category; omitted leaves it unchanged on update. Ownership is enforced in the service. */
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? null : (value as string | null),
  )
  categoryId?: string | null;
}
