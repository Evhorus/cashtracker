import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from 'src/common/dto/paginated-response.dto';
import { ExpenseResponseDto } from './expense-response.dto';

/** Extends pagination meta with `totalAmount` summed across the entire filtered set. */
export class ExpensesPaginationMetaDto extends PaginationMetaDto {
  totalAmount: number;

  constructor(total: number, page: number, limit: number, totalAmount: number) {
    super(total, page, limit);
    this.totalAmount = totalAmount;
  }
}

export class ExpensesPaginatedResponseDto extends PaginatedResponseDto<ExpenseResponseDto> {
  declare meta: ExpensesPaginationMetaDto;

  constructor(
    data: ExpenseResponseDto[],
    total: number,
    page: number,
    limit: number,
    totalAmount: number,
  ) {
    super(data, total, page, limit);
    this.meta = new ExpensesPaginationMetaDto(total, page, limit, totalAmount);
  }
}
