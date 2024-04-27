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

  async getSiteTerms(url: string): Promise<{ id: number; terms: string[] }> {
    const site: SiteTerm = await this.getLastSiteTerm(url);
    console.log(site);
    const terms = site.terms.map(
      ({ title }: ITermsAndCondition): string => title,
    );
    return { terms, id: site.id };
  }

  getSiteTerm(url: string): Promise<SiteTerm> {
    return this.siteTermsRepository.findOne({ where: { site_url: url } });
  }

  getLastSiteTerm(url: string): Promise<SiteTerm> {
    return this.siteTermsRepository.findOne({
      where: {
        site_url: url,
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
        const rank: number = 0;
        // const ranking: number = await this.openAIService.getRankingForTerm(term);
        return {
          rank,
          title,
        };
      }),
    );
  }

  async updateSiteTerms({
    url,
    termsUrl,
    newTerms,
    pageContent,
  }): Promise<SiteTerm> {
    const fingerprint: string = this.md5Service.calculateMd5Hash(pageContent);
    const updatedTerms: ITermsAndCondition[] =
      await this.assignRankToTerms(newTerms);

    const siteTerm: SiteTerm = await this.siteTermsRepository.findOne({
      where: {
        site_url: url,
      },
    });

    if (!siteTerm) {
      const newSiteTerm: SiteTerm = new SiteTerm();
      newSiteTerm.site_url = url;
      newSiteTerm.terms_url = termsUrl;
      newSiteTerm.terms = updatedTerms;
      newSiteTerm.fingerprint = fingerprint;
      await this.siteTermsRepository.save(newSiteTerm);
      return newSiteTerm;
    }

    if (siteTerm.fingerprint === fingerprint) return siteTerm;

    siteTerm.terms = updatedTerms;
    siteTerm.fingerprint = fingerprint;
    await this.siteTermsRepository.save(siteTerm);
    return siteTerm;
  }
}
