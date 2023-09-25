import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { CreateUserTermDto } from 'src/user-terms/dto/create-user-term.dto';
import { MessageResponse } from 'src/response/message-response';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { GoogleService } from 'src/google/google.service';
import { OpenAIService } from 'src/openai/openai.service';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { ViolatedTermsService } from 'src/violated-terms/violated-terms.service';
import { Md5Service } from 'src/md5/md5.service';

@Injectable()
export class UserTermsService {
  constructor(
    @InjectRepository(UserTerm)
    private userTermsRepository: Repository<UserTerm>,
    private violatedTermService: ViolatedTermsService,
    private siteTermsService: SiteTermsService,
    private puppeteerService: PuppeteerService,
    private googleService: GoogleService,
    private openAIService: OpenAIService,
    private md5Service: Md5Service,
  ) {}

  getTermsByUserId(id: number): Promise<UserTerm[]> {
    return this.userTermsRepository.find({
      where: {
        id,
      },
      select: ['id', 'title', 'created_at'],
    });
  }

  async createUserTerm(
    userId: number,
    { title }: CreateUserTermDto,
  ): Promise<MessageResponse> {
    const userTerm: UserTerm = new UserTerm();
    userTerm.user_id = userId;
    userTerm.title = title;

    await this.userTermsRepository.save(userTerm);

    return { message: 'Term created successfully' };
  }

  private async getSiteTerms(
    site: string,
  ): Promise<{ terms: string[]; fingerprint: string }> {
    const termsPage: string =
      await this.googleService.getTermsAndConditionPage(site);
    console.log(site, '=>', termsPage);
    // const terms: string = await this.openAIService.loadText('output.txt');
    const termsPageContent: string =
      await this.puppeteerService.getPageContent(termsPage);
    console.log('End extract');

    const lastFingerprint: string | null =
      await this.siteTermsService.getLastSiteFingerprint(site);
    const newFingerprint: string =
      this.md5Service.calculateMd5Hash(termsPageContent);

    if (lastFingerprint === newFingerprint) {
      const terms: string[] = await this.siteTermsService.getSiteTerms(site);
      console.log('Fingerprint is the same');
      return {
        terms,
        fingerprint: lastFingerprint,
      };
    }

    const chunks: string[] =
      this.openAIService.splitIntoChunks(termsPageContent);
    console.log('Total chunks: ', chunks.length);

    const terms: string[] = await this.openAIService.listPointsByChunks(chunks);

    await this.siteTermsService.updateSiteTerms(site, terms, termsPageContent);

    return { terms, fingerprint: newFingerprint };
  }

  async identifyViolatedTerms(
    userId: number,
    site: string,
  ): Promise<UserTerm[]> {
    const { terms, fingerprint } = await this.getSiteTerms(site);
    const userTerms: UserTerm[] = await this.getTermsByUserId(userId);

    const violatedTerms: UserTerm[] =
      await this.openAIService.getUserViolatedTerms(terms, userTerms);

    if (!!violatedTerms.length)
      this.violatedTermService.create(userId, site, violatedTerms, fingerprint);

    return violatedTerms;
  }
}
