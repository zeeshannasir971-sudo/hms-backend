import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AdminInitService } from './common/services/admin-init.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Initialize hardcoded admin accounts on startup
  try {
    const adminInitService = app.get(AdminInitService);
    await adminInitService.initializeAdmins();
  } catch (error) {
    console.error('Failed to initialize admin accounts:', error);
  }

  await app.listen(3001);
  console.log('HMS Backend is running on http://localhost:3001');
}
bootstrap();