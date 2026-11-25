import {
  CUT_DAY_MAX,
  CUT_DAY_MIN,
  PAYMENT_METHOD_NAME_MAX_LENGTH,
  PAYMENT_METHOD_TYPES,
  PRESET_COLORS,
  type PaymentMethodType,
  type PresetColor,
} from '@cashtracker/shared';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { normalizeString } from '@/common/utils/string-utils';

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(PAYMENT_METHOD_NAME_MAX_LENGTH)
  @Transform(({ value }) => normalizeString(value))
  name: string;

  @IsIn(PAYMENT_METHOD_TYPES)
  type: PaymentMethodType;

  @IsIn(PRESET_COLORS)
  color: PresetColor;

  /** Ignored (stored as null) unless the type is a credit card. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CUT_DAY_MIN)
  @Max(CUT_DAY_MAX)
  cutDay?: number | null;
}
