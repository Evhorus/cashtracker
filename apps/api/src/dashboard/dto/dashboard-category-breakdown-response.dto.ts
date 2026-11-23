import { EnvelopeCategoryDto } from '../../envelopes/dto/envelope-category.dto';

export class DashboardCategoryBreakdownDto {
  /** `null` for expenses whose envelope has no category. */
  category: EnvelopeCategoryDto | null;
  spent: number;
  expenseCount: number;
}
