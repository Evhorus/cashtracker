import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Currency } from 'src/common/enums/currency.enum';

export class DashboardQueryDto {
  /** Calendar year filter on envelope creation date (omitted = all-time). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  /** Currency for the monthly chart; falls back to the user's primary currency if omitted or unused. */
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
