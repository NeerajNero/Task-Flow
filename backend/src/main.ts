// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // === 1. GET ALL PROVIDERS (from your docs) ===
  const logger = app.get(LoggerService);

  // === 2. USE CUSTOM LOGGER (from Logging doc) ===
  app.useLogger(logger);

  // === 3. APPLY SECURITY (from Security doc) ===
  app.enableCors({ origin: '*' }); // TODO: Lock down in prod
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  // === 5. APPLY GLOBAL PIPES (from Error/Security docs) ===
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // === 6. APPLY GLOBAL FILTERS (from Error/Arch docs) ===
  app.useGlobalFilters(
    new HttpExceptionFilter(logger),
    new PrismaClientExceptionFilter(logger),
  );

  // === 7. ENABLE API VERSIONING (from Security doc) ===
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // === SWAGGER DOCUMENTATION (The New Part) ===
  const config = new DocumentBuilder()
    .setTitle('SimpleCRM API')
    .setDescription('The Multi-Tenant CRM API description')
    .setVersion('1.0')
    .addBearerAuth() // Adds the "Authorize" button for JWTs
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Served at /api-docs

  // === 8. START THE APPLICATION ===
  await app.listen(3000);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
