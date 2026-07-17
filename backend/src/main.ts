import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  // 1. Security headers via Helmet
  app.use(helmet());

  // 2. Cookie parser for HttpOnly session cookies
  app.use(cookieParser());

  // 3. CORS Configuration
  app.enableCors({
    origin: [frontendUrl],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip any non-decorated fields
      forbidNonWhitelisted: true, // throw error if non-decorated fields are sent
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  // 5. Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 6. Global Response Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // 7. Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('senco Weekly Planner API')
    .setDescription(
      'REST API for weekly report submission, dashboard tracking, and AI insights.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`🚀 Server running on: http://localhost:${port}`);
  logger.log(`📄 Swagger documentation at: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}
void bootstrap();
