import { Module } from '@nestjs/common';
import { SiteTermsController } from './site-terms.controller';
import { SiteTermsService } from './site-terms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteTerms } from 'src/site-terms/site-terms.model';

@Module({
  controllers: [SiteTermsController],
  providers: [SiteTermsService],
  imports: [TypeOrmModule.forFeature([SiteTerms])],
})
export class SiteTermsModule {}
