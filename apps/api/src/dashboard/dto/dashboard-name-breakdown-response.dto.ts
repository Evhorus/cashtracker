/** Groups spending by exact stored expense name (already normalized on write). */
export class DashboardNameBreakdownDto {
  name: string;
  spent: number;
  expenseCount: number;
}
