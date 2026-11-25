import { Currency, type CurrencyCode } from '@cashtracker/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  IsCalendarDate,
  IsNotBefore,
} from 'src/common/validators/calendar-date.validators';

/** Shared filter contract for breakdown endpoints (`startDate`/`endDate` override `year`). */
export class BreakdownQueryDto {
  @IsEnum(Currency)
  currency: CurrencyCode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsCalendarDate()
  startDate?: string;

  @IsOptional()
  @IsCalendarDate()
  @IsNotBefore('startDate')
  endDate?: string;
}
