import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ERROR_MESSAGES } from '@/common/constants/error-messages';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { CategoriesRepository } from '../categories/repositories/categories.repository';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { EnvelopeResponseDto } from './dto/envelope-response.dto';
import { EnvelopeWithExpensesResponseDto } from './dto/envelope-with-expenses-response.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import {
  type EnvelopeListFilters,
  EnvelopesRepository,
} from './repositories/envelopes.repository';

@Injectable()
export class EnvelopesService {
  constructor(
    private readonly envelopesRepository: EnvelopesRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async assertCategoryIsUsable(
    userId: string,
    categoryId: string | null | undefined,
  ) {
    if (!categoryId) return;

    const category = await this.categoriesRepository.findOwnedById(
      userId,
      categoryId,
    );

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  async create(userId: string, createEnvelopeDto: CreateEnvelopeDto) {
    await this.assertCategoryIsUsable(userId, createEnvelopeDto.categoryId);

    await this.envelopesRepository.create({
      ...createEnvelopeDto,
      spent: 0,
      userId,
    });

    return {
      message: 'Sobre creado',
    };
  }

  async findAllLight(
    userId: string,
    page: number,
    limit: number,
    filters: EnvelopeListFilters = {},
  ) {
    const [envelopes, total] = await this.envelopesRepository.findByUserIdLight(
      userId,
      page,
      limit,
      filters,
    );

    const expenseDates = await this.envelopesRepository.findExpenseDateRanges(
      envelopes.map((envelope) => envelope.id),
    );

    return new PaginatedResponseDto(
      envelopes.map((envelope) =>
        EnvelopeResponseDto.fromEntity(envelope, expenseDates.get(envelope.id)),
      ),
      total,
      page,
      limit,
    );
  }

  async findOneOwned(userId: string, id: string) {
    const envelope = await this.envelopesRepository.findOwnedById(userId, id);

    if (!envelope) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return envelope;
  }

  async findOnePlain(userId: string, id: string) {
    const envelope = await this.envelopesRepository.findOwnedByIdWithExpenses(
      userId,
      id,
    );

    if (!envelope) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return EnvelopeWithExpensesResponseDto.fromEntity(envelope);
  }

  async update(
    userId: string,
    id: string,
    updateEnvelopeDto: UpdateEnvelopeDto,
  ) {
    const envelope = await this.findOneOwned(userId, id);
    await this.assertCategoryIsUsable(userId, updateEnvelopeDto.categoryId);

    const nextCurrency: string | undefined = updateEnvelopeDto.currency;
    const isCurrencyChange =
      nextCurrency !== undefined && nextCurrency !== envelope.currency;

    if (isCurrencyChange) {
      await this.updateWithCurrencyLock(
        userId,
        id,
        nextCurrency,
        updateEnvelopeDto,
      );
    } else {
      await this.envelopesRepository.update(id, updateEnvelopeDto);
    }

    return {
      message: 'Sobre actualizado',
    };
  }

  /** Serializes currency changes with `FOR UPDATE` so concurrent expenses cannot land in the old currency. */
  private async updateWithCurrencyLock(
    userId: string,
    id: string,
    nextCurrency: string,
    updateEnvelopeDto: UpdateEnvelopeDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const locked = await this.envelopesRepository.findOwnedByIdForUpdate(
        userId,
        id,
        manager,
      );
      if (!locked) {
        throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
      }
      const currencyChanged = nextCurrency !== locked.currency;
      if (
        currencyChanged &&
        (await this.envelopesRepository.hasExpenses(id, manager))
      ) {
        throw new ConflictException(ERROR_MESSAGES.ENVELOPE_CURRENCY_LOCKED);
      }
      await this.envelopesRepository.update(id, updateEnvelopeDto, manager);
    });
  }

  async remove(userId: string, id: string) {
    const envelope = await this.findOneOwned(userId, id);
    await this.envelopesRepository.remove(envelope);
    return {
      message: 'Sobre eliminado',
    };
  }
}
