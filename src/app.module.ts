import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { OpenAIService } from 'src/openai/openai.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleService } from 'src/google/google.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/users.model';
import { ContactUs } from 'src/contact-us/contact-us.model';
import { ContactUsModule } from 'src/contact-us/contact-us.module';
import { SiteTermsModule } from './site-terms/site-terms.module';
import { UserTermsModule } from './user-terms/user-terms.module';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { SiteTerms } from 'src/site-terms/site-terms.model';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true,
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRESS_PORT,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      entities: [User, ContactUs, UserTerm, SiteTerms],
    }),
    AuthModule,
    UsersModule,
    ContactUsModule,
    SiteTermsModule,
    UserTermsModule,
  ],
  controllers: [AppController],
  providers: [PuppeteerService, OpenAIService, GoogleService],
})
export class AppModule {}
