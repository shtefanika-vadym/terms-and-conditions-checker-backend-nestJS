import { Injectable, NotFoundException } from '@nestjs/common';
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
import { UsersService } from 'src/users/users.service';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';
import { RephraseResponse } from 'src/user-terms/response/rephrase-response';

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
    private usersService: UsersService,
  ) {}

  getTermsByUserId(id: number): Promise<UserTerm[]> {
    return this.userTermsRepository.find({
      where: {
        user_id: id,
      },
      select: ['id', 'title'],
    });
  }

  private async fetchTermsPageContent(site: string): Promise<string> {
    const termsPage: string =
      await this.googleService.getTermsAndConditionPage(site);
    console.log(site, '=>', termsPage);
    // const terms: string = await this.openAIService.loadText('output.txt');
    const termsPageContent: string =
      await this.puppeteerService.getPageContent(termsPage);
    console.log('End extract');

    return termsPageContent;
  }

  async createUserTerm(
    userId: number,
    { title }: CreateUserTermDto,
  ): Promise<MessageResponse> {
    const userTerm: UserTerm = new UserTerm();
    userTerm.user_id = userId;
    userTerm.title = title;

    try {
      await this.userTermsRepository.save(userTerm);
      await this.usersService.updateUserFingerprint(userId);
    } catch (e) {
      return { message: 'Term already exists' };
    }

    return { message: 'Term created successfully' };
  }

  async deleteUserTerm(userId: number, id: number): Promise<MessageResponse> {
    const term: UserTerm = await this.userTermsRepository.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    await this.userTermsRepository.remove(term);

    return { message: 'Term deleted successfully' };
  }

  private async manageLastFingerprint(
    userId: number,
    site: string,
    pageContent: string,
  ): Promise<{
    isSame: boolean;
    newFingerprint: string;
    lastFingerprint: string;
  }> {
    const userFingerprint: string =
      await this.usersService.getUserFingerprint(userId);

    const lastViolatedTerm: ViolatedTerm =
      await this.violatedTermService.getLastViolatedTerm(site);

    const newFingerprint: string =
      this.md5Service.calculateMd5Hash(pageContent);

    const isSame: boolean =
      lastViolatedTerm.site_fingerprint === newFingerprint &&
      userFingerprint === lastViolatedTerm.user_fingerprint;

    return {
      isSame,
      newFingerprint,
      lastFingerprint: lastViolatedTerm.site_fingerprint,
    };
  }

  private getChunksAndSplitTerms(content: string): Promise<string[]> {
    const chunks: string[] = this.openAIService.splitIntoChunks(content);
    console.log('Total chunks: ', chunks.length);

    return this.openAIService.listPointsByChunks(chunks);
  }

  private async getSiteTermsWithFingerprint(
    userId: number,
    site: string,
  ): Promise<{ terms: string[]; siteFingerprint: string }> {
    const termsPageContent: string = await this.fetchTermsPageContent(site);

    const { isSame, lastFingerprint, newFingerprint } =
      await this.manageLastFingerprint(userId, site, termsPageContent);

    if (isSame) {
      const terms: string[] = await this.siteTermsService.getSiteTerms(site);
      console.log('Fingerprint is the same');
      return {
        terms,
        siteFingerprint: lastFingerprint,
      };
    }

    const terms: string[] = await this.getChunksAndSplitTerms(termsPageContent);

    await this.siteTermsService.updateSiteTerms(site, terms, termsPageContent);

    return { terms, siteFingerprint: newFingerprint };
  }

  async identifyViolatedTerms(
    userId: number,
    site: string,
  ): Promise<UserTerm[]> {
    const { terms, siteFingerprint } = await this.getSiteTermsWithFingerprint(
      userId,
      site,
    );
    const userTerms: UserTerm[] = await this.getTermsByUserId(userId);

    const violatedTerms: UserTerm[] =
      await this.openAIService.getUserViolatedTerms(terms, userTerms);

    this.violatedTermService.create({
      userId,
      site,
      siteFingerprint,
      terms: violatedTerms,
    });

    return violatedTerms;
  }

  async rephrase(dto: CreateUserTermDto): Promise<RephraseResponse> {
    const title: string = await this.openAIService.rephraseTerm(dto.title);
    return { title, isBlocked: title === process.env.OPENAI_NO_RULE_FOUND };
  }
}
