import { Controller, Get } from '@nestjs/common';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { OpenAIService } from 'src/openai/openai.service';
import { GoogleService } from 'src/google/google.service';

@Controller()
export class AppController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly openAIService: OpenAIService,
    private readonly puppeteerService: PuppeteerService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    await this.openAIService.callOpenAIApi();

    return 'Text processing complete!';
    // return this.puppeteerService.getPageContent(
    //   'https://old.ms.ro/index.php?pag=26&doc=3229&pg=1',
    // );
    // return this.openAIService.getPageContent();
    return this.googleService.getFirstPageUrlByQuery(
      'https://chat.openai.com/ terms and conditions',
    );
  }
}
