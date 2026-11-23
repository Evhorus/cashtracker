import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ERROR_MESSAGES } from 'src/common/constants/error-messages';
import { isUniqueViolation } from 'src/common/utils/postgres-errors';
import { ICON_KEYS } from './constants/icon-keys';
import { PRESET_COLORS } from './constants/preset-colors';
import { CategoryUsageDto } from './dto/category-usage-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './repositories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  getOptions() {
    return { icons: ICON_KEYS, colors: PRESET_COLORS };
  }

  async findAllForUser(userId: string) {
    const owned = await this.categoriesRepository.findAllOwned(userId);
    // Any isDefault row proves the account was already seeded, skipping category_seed lookup.
    if (owned.some((category) => category.isDefault)) {
      return owned;
    }
    if (await this.categoriesRepository.hasBeenSeeded(userId)) {
      return owned;
    }
    await this.categoriesRepository.seedDefaultsFor(userId);
    return this.categoriesRepository.findAllOwned(userId);
  }

  private async ensureSeeded(userId: string) {
    if (await this.categoriesRepository.hasBeenSeeded(userId)) return;
    await this.categoriesRepository.seedDefaultsFor(userId);
  }

  private async assertLabelAvailable(
    userId: string,
    label: string,
    excludeCategoryId?: string,
  ) {
    // Seed first so predefined labels cannot collide with a category created before first list load.
    await this.ensureSeeded(userId);
    const existing = await this.categoriesRepository.findOwnedByLabel(
      userId,
      label,
    );
    if (existing && existing.id !== excludeCategoryId) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
    }
  }

  async countEnvelopesByCategory(userId: string): Promise<CategoryUsageDto[]> {
    return this.categoriesRepository.countEnvelopesByCategory(userId);
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    await this.assertLabelAvailable(userId, createCategoryDto.label);

    try {
      const created = await this.categoriesRepository.create({
        ...createCategoryDto,
        userId,
      });

      return {
        id: created.id,
        message: 'Categoría creada',
      };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async findOneOwned(userId: string, id: string) {
    const category = await this.categoriesRepository.findOwnedById(userId, id);

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.findOneOwned(userId, id);

    if (updateCategoryDto.label && updateCategoryDto.label !== category.label) {
      await this.assertLabelAvailable(userId, updateCategoryDto.label, id);
    }

    try {
      await this.categoriesRepository.update(id, updateCategoryDto);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }
      throw error;
    }

    return {
      message: 'Categoría actualizada',
    };
  }

  async remove(userId: string, id: string) {
    const category = await this.findOneOwned(userId, id);
    await this.categoriesRepository.remove(category);
    return {
      message: 'Categoría eliminada',
    };
  }
}
