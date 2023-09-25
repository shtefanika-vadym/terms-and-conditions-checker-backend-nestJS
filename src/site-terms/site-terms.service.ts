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
    const siteTerms: SiteTerm = await this.getLastSiteTerm(site);

    return siteTerms.terms.map(
      ({ title }: ITermsAndCondition): string => title,
    );
  }

  getSiteTerm(site: string): Promise<SiteTerm> {
    return this.siteTermsRepository.findOne({ where: { site } });
  }

  private getLastSiteTerm(site: string): Promise<SiteTerm> {
    return this.siteTermsRepository.findOne({
      where: {
        site,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async getLastSiteFingerprint(site: string): Promise<string | null> {
    const siteTerm: SiteTerm = await this.getLastSiteTerm(site);
    return siteTerm?.fingerprint;
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

    if (siteTerm?.fingerprint === fingerprint) return;

    const newSiteTerm: SiteTerm = new SiteTerm();
    newSiteTerm.site = site;
    newSiteTerm.terms = updatedTerms;
    newSiteTerm.fingerprint = fingerprint;
    await this.siteTermsRepository.save(newSiteTerm);
  }
}
