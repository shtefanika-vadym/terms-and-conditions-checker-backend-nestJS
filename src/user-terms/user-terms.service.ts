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
import { UserHistoryService } from 'src/user-history/user-history.service';

@Injectable()
export class UserTermsService {
  constructor(
    @InjectRepository(UserTerm)
    private userTermsRepository: Repository<UserTerm>,
    private violatedTermService: ViolatedTermsService,
    private userHistoryService: UserHistoryService,
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

  private async fetchTermsPageContent(url: string) {
    const termsUrl: string =
      await this.googleService.getPageTermsAndConditions(url);
    console.log(url, '=>', termsUrl);
    // const terms: string = await this.openAIService.loadText('output.txt');
    const content: string =
      await this.puppeteerService.getPageContent(termsUrl);
    console.log('End extract');

    return { content, termsUrl };
  }

  async createUserTerm(
    userId: number,
    { title }: CreateUserTermDto,
  ): Promise<MessageResponse> {
    const userTerm: UserTerm = new UserTerm();
    userTerm.user_id = userId;
    userTerm.title = title;

    await this.userTermsRepository.save(userTerm);
    this.usersService.updateUserFingerprint(userId);

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
    this.usersService.updateUserFingerprint(userId);

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

    if (lastViolatedTerm) {
      const isSame: boolean =
        lastViolatedTerm.site_fingerprint === newFingerprint &&
        userFingerprint === lastViolatedTerm.user_fingerprint;

      return {
        isSame,
        newFingerprint,
        lastFingerprint: lastViolatedTerm.site_fingerprint,
      };
    }

    return {
      isSame: false,
      newFingerprint,
      lastFingerprint: null,
    };
  }

  private getChunksAndSplitTerms(content: string): Promise<string[]> {
    const chunks: string[] = this.openAIService.splitIntoChunks(content);
    console.log('Total chunks: ', chunks.length);

    return this.openAIService.listPointsByChunks(chunks);
  }

  private async getSiteTermsWithFingerprint(
    userId: number,
    url: string,
  ): Promise<{
    id: number;
    terms: string[];
    isSame: boolean;
    siteFingerprint: string;
  }> {
    const { content: termsPageContent, termsUrl } =
      await this.fetchTermsPageContent(url);

    const { isSame, lastFingerprint, newFingerprint } =
      await this.manageLastFingerprint(userId, url, termsPageContent);

    if (isSame) {
      const term = await this.siteTermsService.getSiteTermsWithId(url);
      console.log('Same fingerprint');
      return {
        ...term,
        isSame,
        siteFingerprint: lastFingerprint,
      };
    }

    const terms: string[] = await this.getChunksAndSplitTerms(termsPageContent);

    const { id } = await this.siteTermsService.updateSiteTerms({
      url,
      termsUrl,
      newTerms: terms,
      pageContent: termsPageContent,
    });

    return { terms, id, isSame, siteFingerprint: newFingerprint };
  }

  async checkForTermsViolations(
    userId: number,
    url: string,
  ): Promise<{ hasSameFingerprint: boolean }> {
    const {
      terms,
      isSame,
      id: siteId,
      siteFingerprint,
    } = await this.getSiteTermsWithFingerprint(userId, url);
    const userTerms: UserTerm[] = await this.getTermsByUserId(userId);

    const violatedTerms: UserTerm[] =
      await this.openAIService.getUserViolatedTerms(terms, userTerms);

    const violatedTerm: ViolatedTerm = await this.violatedTermService.create({
      url,
      userId,
      siteFingerprint,
      terms: violatedTerms,
    });

    this.userHistoryService.create(userId, siteId, violatedTerm.id);

    return { hasSameFingerprint: isSame };
  }

  async rephrase({ title }: CreateUserTermDto): Promise<RephraseResponse> {
    return this.openAIService.rephraseTerm(title);
  }
}
