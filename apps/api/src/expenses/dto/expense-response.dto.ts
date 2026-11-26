import { ExpensePaymentMethodDto } from '@/payment-methods/dto/payment-method-response.dto';
import { Expense } from '@/expenses/entities/expense.entity';

export class ExpenseResponseDto {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: Date;
  description?: string;
  paymentMethod: ExpensePaymentMethodDto | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date,
      description: expense.description,
      paymentMethod: ExpensePaymentMethodDto.fromEntity(expense.paymentMethod),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  static fromEntities(expenses: Expense[]): ExpenseResponseDto[] {
    return expenses.map((expense) => this.fromEntity(expense));
  }
}
