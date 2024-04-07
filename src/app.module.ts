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
import { SiteTermsModule } from './site-terms/site-terms.module';
import { UserTermsModule } from './user-terms/user-terms.module';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { SiteTerm } from 'src/site-terms/site-terms.model';
import { ViolatedTermsModule } from './violated-terms/violated-terms.module';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';

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
      entities: [User, UserTerm, SiteTerm, ViolatedTerm],
    }),
    AuthModule,
    UsersModule,
    SiteTermsModule,
    UserTermsModule,
    ViolatedTermsModule,
  ],
  controllers: [AppController],
  providers: [PuppeteerService, OpenAIService, GoogleService],
})
export class AppModule {}
