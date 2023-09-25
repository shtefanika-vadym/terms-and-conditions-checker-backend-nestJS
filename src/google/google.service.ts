import { Injectable } from '@nestjs/common';
import * as process from 'process';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GoogleService {
  constructor(private readonly httpService: HttpService) {}
  private async getFirstPageUrlByQuery(query: string): Promise<string> {
    const apiUrl: string = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_KEY}&cx=${process.env.GOOGLE_CX}&q=${query}`;

    const {
      data: { items = [] },
    } = await firstValueFrom(
      this.httpService.get(apiUrl).pipe(
        catchError((error: AxiosError): Promise<any> => {
          throw error;
        }),
      ),
    );
    return items.at(0).link;
  }
  async getTermsAndConditionPage(site: string): Promise<string> {
    return this.getFirstPageUrlByQuery(`${site} terms and conditions`);
  }
}
