import { forwardRef, Module } from '@nestjs/common';
import { UserTermsController } from './user-terms.controller';
import { UserTermsService } from './user-terms.service';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { GoogleService } from 'src/google/google.service';
import { OpenAIService } from 'src/openai/openai.service';
import { HttpModule } from '@nestjs/axios';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { SiteTerm } from 'src/site-terms/site-terms.model';
import { Md5Service } from 'src/md5/md5.service';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';
import { ViolatedTermsService } from 'src/violated-terms/violated-terms.service';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { UserHistory } from 'src/user-history/user-history.model';
import { UserHistoryService } from 'src/user-history/user-history.service';
import { PromptService } from 'src/prompt/prompt.service';

@Module({
  controllers: [UserTermsController],
  providers: [
    UserTermsService,
    PuppeteerService,
    GoogleService,
    OpenAIService,
    PromptService,
    ViolatedTermsService,
    SiteTermsService,
    Md5Service,
    UsersService,
    UserHistoryService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserTerm,
      SiteTerm,
      ViolatedTerm,
      UserHistory,
    ]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
})
export class UserTermsModule {}
