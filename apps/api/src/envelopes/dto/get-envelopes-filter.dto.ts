import {
  ENVELOPE_SORTS,
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeSort,
  type EnvelopeStatusFilter,
} from '@cashtracker/shared';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export { ENVELOPE_SORTS, type EnvelopeSort };

export class GetEnvelopesFilterDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Filtered in SQL via `buildEnvelopeStatusPredicate` so pagination `total` stays accurate. */
  @IsOptional()
  @IsIn(ENVELOPE_STATUS_FILTERS as readonly string[])
  status?: EnvelopeStatusFilter;

  /** Orders by latest expense date, falling back to `createdAt` (defaults to `recent`). */
  @IsOptional()
  @IsIn(ENVELOPE_SORTS)
  sort?: EnvelopeSort;
}
