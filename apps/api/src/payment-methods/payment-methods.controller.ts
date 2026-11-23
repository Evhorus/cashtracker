import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAllForUser(userId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.service.create(userId, dto);
  }

  @Patch(':paymentMethodId')
  update(
    @CurrentUser('id') userId: string,
    @Param('paymentMethodId', ParseUUIDPipe) paymentMethodId: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.service.update(userId, paymentMethodId, dto);
  }

  @Delete(':paymentMethodId')
  remove(
    @CurrentUser('id') userId: string,
    @Param('paymentMethodId', ParseUUIDPipe) paymentMethodId: string,
  ) {
    return this.service.remove(userId, paymentMethodId);
  }
}
