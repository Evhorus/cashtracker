import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';

const logger = new Logger('CashTrackerApp');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('CLIENT_URL'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Close TypeORM pools cleanly on SIGTERM/SIGINT during container shutdown.
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 4000);

  await app.listen(port);
  logger.log(`App is running on port ${port}`);
}

void bootstrap();
