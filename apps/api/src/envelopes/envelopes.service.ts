import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { EnvelopeResponseDto } from './dto/envelope-response.dto';
import type { EnvelopeListFilters } from './repositories/envelopes.repository';
import { EnvelopeWithExpensesResponseDto } from './dto/envelope-with-expenses-response.dto';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import { EnvelopesRepository } from './repositories/envelopes.repository';
import { CategoriesRepository } from '../categories/repositories/categories.repository';

@Injectable()
export class EnvelopesService {
  constructor(
    private readonly envelopesRepository: EnvelopesRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Envelopes reference categories by id now, so a well-formed uuid
   * belonging to another user has to be rejected here - the DTO can
   * validate the shape but not who is asking. `null` clears the
   * category and is always allowed; `undefined` means "leave it alone"
   * on an update and is passed through untouched.
   */
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

  /**
   * Find all envelopes without expenses (light query for list view),
   * paginated (page is 1-indexed). `filters.search` optionally filters
   * by name/category; `filters.status` by derived spending status, in
   * SQL, so `total` reflects the filtered set.
   */
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

  async findOne(id: string) {
    const envelope = await this.envelopesRepository.findById(id);

    if (!envelope) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return envelope;
  }

  async findOnePlain(id: string) {
    const envelope = await this.envelopesRepository.findByIdWithExpenses(id);

    if (!envelope) {
      throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
    }

    return EnvelopeWithExpensesResponseDto.fromEntity(envelope);
  }

  /**
   * `spent` is a sum of expenses in the envelope's currency, so once it
   * has expenses the currency is fixed: relabelling COP 100.000 as USD
   * 100.000 would be silently wrong. Re-sending the same currency (the
   * edit form always sends it) is not a change.
   *
   * When the currency actually changes, the check and update run under
   * the same `SELECT ... FOR UPDATE` row lock that ExpensesService.create
   * takes, so a concurrent expense in the old currency cannot land
   * between `hasExpenses()` and `update()`.
   */
  async update(id: string, updateEnvelopeDto: UpdateEnvelopeDto) {
    const envelope = await this.findOne(id);
    await this.assertCategoryIsUsable(
      envelope.userId,
      updateEnvelopeDto.categoryId,
    );

    const nextCurrency: string | undefined = updateEnvelopeDto.currency;
    const isCurrencyChange =
      nextCurrency !== undefined && nextCurrency !== envelope.currency;

    if (isCurrencyChange) {
      await this.dataSource.transaction(async (manager) => {
        const locked = await this.envelopesRepository.findByIdForUpdate(
          id,
          manager,
        );
        if (!locked) {
          throw new NotFoundException(ERROR_MESSAGES.ENVELOPE_NOT_FOUND);
        }
        if (
          nextCurrency !== locked.currency &&
          (await this.envelopesRepository.hasExpenses(id, manager))
        ) {
          throw new ConflictException(ERROR_MESSAGES.ENVELOPE_CURRENCY_LOCKED);
        }
        await this.envelopesRepository.update(id, updateEnvelopeDto, manager);
      });
    } else {
      await this.envelopesRepository.update(id, updateEnvelopeDto);
    }

    return {
      message: 'Sobre actualizado',
    };
  }

  async remove(id: string) {
    const envelope = await this.findOne(id);
    await this.envelopesRepository.remove(envelope);
    return {
      message: 'Sobre eliminado',
    };
  }
}
