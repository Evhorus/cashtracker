import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from '@/categories/categories.module';
import { Envelope } from './entities/envelope.entity';
import { EnvelopesController } from './envelopes.controller';
import { EnvelopesService } from './envelopes.service';
import { EnvelopesRepository } from './repositories/envelopes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Envelope]), CategoriesModule],
  controllers: [EnvelopesController],
  providers: [EnvelopesService, EnvelopesRepository],
  exports: [EnvelopesService, EnvelopesRepository],
})
export class EnvelopesModule {}
