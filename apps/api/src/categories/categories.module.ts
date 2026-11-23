import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { CategorySeed } from './entities/category-seed.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategorySeed])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
