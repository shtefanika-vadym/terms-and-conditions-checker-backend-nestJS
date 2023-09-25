import { forwardRef, Module } from '@nestjs/common';
import { ViolatedTermsController } from './violated-terms.controller';
import { ViolatedTermsService } from './violated-terms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';
import { Md5Service } from 'src/md5/md5.service';
import { OpenAIService } from 'src/openai/openai.service';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { SiteTerm } from 'src/site-terms/site-terms.model';

@Module({
  controllers: [ViolatedTermsController],
  providers: [
    ViolatedTermsService,
    Md5Service,
    OpenAIService,
    SiteTermsService,
  ],
  imports: [
    TypeOrmModule.forFeature([ViolatedTerm, SiteTerm]),
    forwardRef(() => AuthModule),
  ],
})
export class ViolatedTermsModule {}