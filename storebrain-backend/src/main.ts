import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'body-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.useLogger(app.get(Logger));
  // app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  await app.listen(3010, '0.0.0.0');

}
bootstrap();
