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
import { SiteTerm } from 'src/site-terms/site-terms.model';

@Injectable()
export class UserTermsService {
  constructor(
    @InjectRepository(UserTerm)
    private userTermsRepository: Repository<UserTerm>,
    private siteTermsService: SiteTermsService,
    private puppeteerService: PuppeteerService,
    private googleService: GoogleService,
    private openAIService: OpenAIService,
  ) {}

  getTermsByUserId(id: number): Promise<UserTerm[]> {
    return this.userTermsRepository.find({
      where: {
        id,
      },
    });
  }

  async createUserTerm(
    id: number,
    { title }: CreateUserTermDto,
  ): Promise<MessageResponse> {
    const userTerm: UserTerm = new UserTerm();
    userTerm.id = id;
    userTerm.title = title;

    await this.userTermsRepository.save(userTerm);

    return { message: 'Term created successfully' };
  }

  private async getSiteTerms(site: string): Promise<string[]> {
    // const termsPage: string =
    //   await this.googleService.getTermsAndConditionPage(site);
    // console.log(site, '=>', termsPage);
    const terms: string = await this.openAIService.loadText('output.txt');
    // const terms: string = await this.puppeteerService.getPageContent(termsPage);
    // console.log('End extract');
    // const chunks: string[] = this.openAIService.splitIntoChunks(terms);
    // console.log('Total chunks: ', chunks.length);
    //
    // const oldSiteTerms: string[] =
    //   await this.siteTermsService.getSiteTerms(site);
    //
    // if (!!oldSiteTerms.length) {
    //   return oldSiteTerms;
    // }
    //
    // const termsKeyPoints: string[] =
    //   await this.openAIService.listPointsByChunks(chunks);

    this.siteTermsService.updateSiteTerms(site, ['termsKeyPoints1s'], terms);

    return ['termsKeyPoints'];
  }

  async identifyViolatedTerms(id: number, site: string): Promise<any> {
    const terms: string[] = await this.getSiteTerms(site);
    const userTerms: UserTerm[] = await this.getTermsByUserId(id);

    const violatedTerms: UserTerm[] =
      await this.openAIService.getUserViolatedTerms(terms, userTerms);

    return violatedTerms;
  }
}
