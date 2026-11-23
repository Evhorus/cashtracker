import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { GetEnvelopesFilterDto } from './dto/get-envelopes-filter.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import { EnvelopesService } from './envelopes.service';

@Controller('envelopes')
export class EnvelopesController {
  constructor(private readonly envelopesService: EnvelopesService) {}

  @Post()
  createEnvelope(
    @Body() createEnvelopeDto: CreateEnvelopeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.envelopesService.create(userId, createEnvelopeDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() { page, limit, search, status, sort }: GetEnvelopesFilterDto,
  ) {
    return this.envelopesService.findAllLight(userId, page, limit, {
      search,
      status,
      sort,
    });
  }

  @Get(':envelopeId')
  findEnvelope(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
  ) {
    return this.envelopesService.findOnePlain(userId, envelopeId);
  }

  @Patch(':envelopeId')
  updateEnvelope(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
    @Body() updateEnvelopeDto: UpdateEnvelopeDto,
  ) {
    return this.envelopesService.update(userId, envelopeId, updateEnvelopeDto);
  }

  @Delete(':envelopeId')
  remove(
    @CurrentUser('id') userId: string,
    @Param('envelopeId', ParseUUIDPipe) envelopeId: string,
  ) {
    return this.envelopesService.remove(userId, envelopeId);
  }
}
