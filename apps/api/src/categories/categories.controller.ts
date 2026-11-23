import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    const categories = await this.categoriesService.findAllForUser(userId);
    return CategoryResponseDto.fromEntities(categories);
  }

  // Registered before `:categoryId` routes so `"usage"` is never parsed as a UUID.
  @Get('usage')
  countEnvelopesByCategory(@CurrentUser('id') userId: string) {
    return this.categoriesService.countEnvelopesByCategory(userId);
  }

  @Get('options')
  getOptions() {
    return this.categoriesService.getOptions();
  }

  @Post()
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.create(userId, createCategoryDto);
  }

  @Patch(':categoryId')
  updateCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.update(userId, categoryId, updateCategoryDto);
  }

  @Delete(':categoryId')
  remove(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.remove(userId, categoryId);
  }
}
