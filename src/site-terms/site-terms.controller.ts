import { Controller, Get, Query } from '@nestjs/common';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { SiteTerm } from 'src/site-terms/site-terms.model';
import { ITermsAndCondition } from 'src/site-terms/interfaces/terms-and-condition.interface';

@Controller('site-terms')
export class SiteTermsController {
  constructor(private siteTermsService: SiteTermsService) {}

  @Get()
  async getSiteTerms(
    @Query('site') url: string,
  ): Promise<ITermsAndCondition[]> {
    const siteTerm: SiteTerm = await this.siteTermsService.getLastSiteTerm(url);
    return siteTerm?.terms || [];
  }
}
