import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages';
import { isUniqueViolation } from 'src/common/utils/postgres-errors';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategoryUsageDto } from './dto/category-usage-response.dto';
import { ICON_KEYS } from './constants/icon-keys';
import { PRESET_COLORS } from './constants/preset-colors';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * The curated icon/color whitelist CreateCategoryDto/UpdateCategoryDto
   * already validate against (IsIn(ICON_KEYS)/IsIn(PRESET_COLORS)) -
   * exposed here too so the frontend's create-category form can render
   * the same grid instead of hardcoding its own duplicate copy of these
   * lists that would silently drift out of sync with what the backend
   * actually accepts.
   */
  getOptions() {
    return { icons: ICON_KEYS, colors: PRESET_COLORS };
  }

  /**
   * The user's own categories. The first call for an account also gives
   * them their copy of the predefined set (see seedDefaultsFor), so every
   * category here can be renamed or deleted - none is shared.
   */
  async findAllForUser(userId: string) {
    await this.ensureSeeded(userId);
    return this.categoriesRepository.findAllOwned(userId);
  }

  private async ensureSeeded(userId: string) {
    // The cheap read first: the transaction only runs for the one request
    // that actually needs it.
    if (await this.categoriesRepository.hasBeenSeeded(userId)) return;
    await this.categoriesRepository.seedDefaultsFor(userId);
  }

  /**
   * Envelope counts per category - see
   * CategoriesRepository.countEnvelopesByCategory for why this is
   * separate from findAllForUser and from the dashboard breakdown.
   */
  async countEnvelopesByCategory(userId: string): Promise<CategoryUsageDto[]> {
    return this.categoriesRepository.countEnvelopesByCategory(userId);
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Before the duplicate check, so a name the predefined set would have
    // brought in is not silently taken by a category created first.
    await this.ensureSeeded(userId);
    const existing = await this.categoriesRepository.findOwnedByLabel(
      userId,
      createCategoryDto.label,
    );
    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
    }

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

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.label && updateCategoryDto.label !== category.label) {
      // Only ever reachable via the CategoryExists guard, which already
      // confirmed category.userId === the caller's own id - safe to treat
      // as non-null here. Seeded first, so a name the predefined set brings
      // in (differing only by case) is rejected like any other duplicate.
      await this.ensureSeeded(category.userId as string);
      const existing = await this.categoriesRepository.findOwnedByLabel(
        category.userId as string,
        updateCategoryDto.label,
      );
      if (existing && existing.id !== category.id) {
        throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }
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

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return {
      message: 'Categoría eliminada',
    };
  }
}
