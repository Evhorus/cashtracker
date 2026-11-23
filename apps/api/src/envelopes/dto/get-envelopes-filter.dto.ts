import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from '../utils/envelope-status';

export const ENVELOPE_SORTS = ['recent', 'oldest'] as const;
export type EnvelopeSort = (typeof ENVELOPE_SORTS)[number];

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
