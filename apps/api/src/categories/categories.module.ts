import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategorySeed } from './entities/category-seed.entity';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './repositories/categories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategorySeed])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
