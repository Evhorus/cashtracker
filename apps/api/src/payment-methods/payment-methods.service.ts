import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages';
import { isUniqueViolation } from 'src/common/utils/postgres-errors';
import { PaymentMethodsRepository } from './repositories/payment-methods.repository';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import {
  TYPES_WITH_CUT_DAY,
  type PaymentMethodType,
} from './constants/payment-method-types';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly repository: PaymentMethodsRepository) {}

  async findAllForUser(userId: string) {
    return PaymentMethodResponseDto.fromEntities(
      await this.repository.findAllForUser(userId),
    );
  }

  async findOne(id: string) {
    const method = await this.repository.findById(id);
    if (!method) {
      throw new NotFoundException(ERROR_MESSAGES.PAYMENT_METHOD_NOT_FOUND);
    }
    return method;
  }

  /**
   * A cut-off day only means something for a credit card; for any other
   * type it is dropped rather than rejected, so switching a card to
   * "debit" never leaves a stale day behind.
   */
  private cutDayFor(type: PaymentMethodType, cutDay?: number | null) {
    return TYPES_WITH_CUT_DAY.includes(type) ? (cutDay ?? null) : null;
  }

  private async assertNameIsFree(
    userId: string,
    name: string,
    exceptId?: string,
  ) {
    const existing = await this.repository.findForUserByName(userId, name);
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(ERROR_MESSAGES.PAYMENT_METHOD_ALREADY_EXISTS);
    }
  }

  async create(userId: string, dto: CreatePaymentMethodDto) {
    await this.assertNameIsFree(userId, dto.name);
    try {
      const created = await this.repository.create({
        ...dto,
        cutDay: this.cutDayFor(dto.type, dto.cutDay),
        userId,
      });
      return { id: created.id, message: 'Medio de pago creado' };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          ERROR_MESSAGES.PAYMENT_METHOD_ALREADY_EXISTS,
        );
      }
      throw error;
    }
  }

  async update(method: PaymentMethod, dto: UpdatePaymentMethodDto) {
    if (dto.name !== undefined) {
      await this.assertNameIsFree(method.userId, dto.name, method.id);
    }
    const type = dto.type ?? method.type;
    const cutDay = dto.cutDay !== undefined ? dto.cutDay : method.cutDay;
    try {
      await this.repository.update(method.id, {
        ...dto,
        cutDay: this.cutDayFor(type, cutDay),
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          ERROR_MESSAGES.PAYMENT_METHOD_ALREADY_EXISTS,
        );
      }
      throw error;
    }
    return { message: 'Medio de pago actualizado' };
  }

  /** Its expenses keep existing and simply lose the payment method
   * (ON DELETE SET NULL), like envelopes losing a deleted category. */
  async remove(method: PaymentMethod) {
    await this.repository.remove(method);
    return { message: 'Medio de pago eliminado' };
  }
}
