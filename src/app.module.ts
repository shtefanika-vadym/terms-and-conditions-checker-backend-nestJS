import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { OpenAIService } from 'src/openai/openai.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleService } from 'src/google/google.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import typeorm from 'src/database/typeorm';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [PuppeteerService, OpenAIService, GoogleService],
})
export class AppModule {}
