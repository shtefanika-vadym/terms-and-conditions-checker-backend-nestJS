import { Module } from '@nestjs/common';
import { SiteTermsController } from './site-terms.controller';
import { SiteTermsService } from './site-terms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteTerm } from 'src/site-terms/site-terms.model';
import { Md5Service } from 'src/md5/md5.service';
import { OpenAIService } from 'src/openai/openai.service';

@Module({
  controllers: [SiteTermsController],
  providers: [SiteTermsService, Md5Service, OpenAIService],
  imports: [TypeOrmModule.forFeature([SiteTerm])],
})
export class SiteTermsModule {}
