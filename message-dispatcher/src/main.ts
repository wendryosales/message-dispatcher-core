import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Message Dispatcher API')
    .setDescription(
      'API for Message Dispatcher. This API is used to manage messages for Message Dispatcher.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: '/api-json',
    swaggerOptions: {
      filter: true,
    },
  });
}

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT = app.get(ConfigService).get('PORT');

  // https://docs.nestjs.com/pipes#global-scoped-pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await setupSwagger(app);
  await app.listen(PORT);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
