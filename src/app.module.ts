import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { OpenAIService } from 'src/openai/openai.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleService } from 'src/google/google.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [PuppeteerService, OpenAIService, GoogleService],
})
export class AppModule {}
