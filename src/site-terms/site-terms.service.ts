import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteTerm } from 'src/site-terms/site-terms.model';
import { Md5Service } from 'src/md5/md5.service';
import { OpenAIService } from 'src/openai/openai.service';
import { ITermsAndCondition } from 'src/site-terms/interfaces/terms-and-condition.interface';

@Injectable()
export class SiteTermsService {
  constructor(
    @InjectRepository(SiteTerm)
    private siteTermsRepository: Repository<SiteTerm>,
    private md5Service: Md5Service,
    private openAIService: OpenAIService,
  ) {}

  async getSiteTerms(site: string): Promise<string[]> {
    const siteTerms: SiteTerm[] = await this.siteTermsRepository.find({
      where: {
        site,
      },
    });

    return ['siteTerms.map(({ title }: SiteTerm) => title);'];
  }

  private async assignRankToTerms(terms: string[]): Promise<any> {
    return Promise.all(
      terms.map(async (title: string): Promise<any> => {
        const ranking: number = 0;
        // const ranking: number = await this.openAIService.getRankingForTerm(term);
        return {
          title,
          ranking,
        };
      }),
    );
  }

  async updateSiteTerms(
    site: string,
    newTerms: string[],
    pageContent: string,
  ): Promise<void> {
    const fingerprint: string = this.md5Service.calculateMd5Hash(pageContent);
    const updatedTerms: ITermsAndCondition[] =
      await this.assignRankToTerms(newTerms);

    const siteTerm: SiteTerm = await this.siteTermsRepository.findOne({
      where: {
        site,
      },
    });

    if (!siteTerm) {
      const newSiteTerm: SiteTerm = new SiteTerm();
      newSiteTerm.site = site;
      newSiteTerm.terms = updatedTerms;
      newSiteTerm.fingerprint = fingerprint;
      this.siteTermsRepository.save(newSiteTerm);
    } else {
      siteTerm.fingerprint = fingerprint;
      siteTerm.terms = updatedTerms;
      this.siteTermsRepository.save(siteTerm);
    }
  }
}
