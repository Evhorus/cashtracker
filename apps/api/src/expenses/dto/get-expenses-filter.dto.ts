import {
  EXPENSE_SORT_BY_FIELDS,
  EXPENSE_SORT_DIRECTIONS,
  type ExpenseSortBy,
  type ExpenseSortDirection,
} from '@cashtracker/shared';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { toBoolean, toStringList } from '@/common/utils/query-transforms';
import {
  IsCalendarDate,
  IsNotBefore,
} from '@/common/validators/calendar-date.validators';

export class GetExpensesFilterDto extends PaginationQueryDto {
  @IsOptional()
  @IsCalendarDate()
  startDate?: string;

  @IsOptional()
  @IsCalendarDate()
  @IsNotBefore('startDate')
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(EXPENSE_SORT_DIRECTIONS)
  sort?: ExpenseSortDirection;

  /** What `sort` orders by: the expense date (default) or the amount. */
  @IsOptional()
  @IsIn(EXPENSE_SORT_BY_FIELDS)
  sortBy?: ExpenseSortBy;

  /** Only expenses paid with one of these. With `includeUnassigned`,
   * also those without a payment method. Neither set = all expenses. */
  @IsOptional()
  @Transform(({ value }) => toStringList(value))
  @IsArray()
  @IsUUID('all', { each: true })
  paymentMethodIds?: string[];

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  includeUnassigned?: boolean;
}
