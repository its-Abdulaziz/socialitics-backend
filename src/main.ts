import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 3000;
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );  

  app.use(bodyParser.text({ type: 'text/plain' })); //allow endpoints to take in raw text data
  app.use(bodyParser.json({ limit: '50mb' })); //increase request body limit to 50mb
  app.use(express.json());
  app.use(bodyParser.json()); // Parse JSON bodies
  app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
  app.enableCors();

  await app.listen(PORT);
  
  console.log(`Server is running on: ${await app.getUrl()} and PORT: ${PORT} ${process.env.ENV}`);

}
bootstrap();
