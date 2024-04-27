import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PuppeteerService {
  async getPageContent(url: string): Promise<string> {
    let result: string;
    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: 'new',
    });
    const page: puppeteer.Page = await browser.newPage();

    await page.goto(url);

    try {
      await page.waitForSelector('body', { timeout: 10000 });

      result = await page.evaluate(() => {
        return document.body.innerText;
      });
    } catch (error) {
      console.error('Text not found on the page:', error);
    }

    await browser.close();
    return result;
  }
}
