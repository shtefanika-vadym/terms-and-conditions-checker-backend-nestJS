import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';
import * as process from 'process';
import { UserTerm } from 'src/user-terms/user-terms.model';

@Injectable()
export class OpenAIService {
  private readonly MAX_TOKENS: number =
    +process.env.OPENAI_KEY_POINTS_MAX_TOKENS;
  private readonly openai: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  private readonly USER_TS = [{ id: 1, title: 'Accept users under 13 years' }];

  private readonly tokenizer: GPT3Tokenizer = new GPT3Tokenizer({
    type: 'gpt3',
  });

  constructor() {}

  async loadText(file_path: string): Promise<string> {
    return await fs.readFile(file_path, 'utf-8');
  }

  private getMaxTokensForSummary(chunksLength: number): number {
    return Math.floor(this.MAX_TOKENS / chunksLength);
  }

  private async keyPointsExtraction(
    text: string,
    maxSummaryTokens: number,
  ): Promise<string> {
    const response: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: process.env.OPENAI_KEY_POINTS_MODEL,
        messages: [
          {
            role: 'system',
            content: `${process.env.OPENAI_KEY_POINTS_RESPONSE} ${maxSummaryTokens} tokens.`,
          },
          {
            role: 'user',
            content:
              text +
              'Response should be an array of strings. Without any additional text.',
          },
        ],
      });
    const result: string = response.choices.at(0).message.content.trim();

    if (result.includes(process.env.OPENAI_NO_TERMS_FOUND)) {
      console.log('No terms found.');
      throw new Error(process.env.OPENAI_NO_TERMS_FOUND);
    }
    return result;
  }

  private async violatedTerms(
    terms: string[],
    userTerms: UserTerm[],
  ): Promise<number[]> {
    const siteTermsProp: string = `Site Terms: ${terms.join('\n')}`;
    const userTermsProp: string = `User terms: + ${JSON.stringify(userTerms)}`;

    const response: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: process.env.OPENAI_VIOLAIONS_MODEL,
        messages: [
          {
            role: 'user',
            content:
              siteTermsProp +
              userTermsProp +
              process.env.OPENAI_VIOLATIONS_RESPONSE,
          },
        ],
      });
    return JSON.parse(response.choices.at(0).message.content);
  }

  async listPointsByChunks(chunks: string[]): Promise<string[]> {
    try {
      const keyPoints: string[] = await Promise.all(
        chunks.map(async (chunk: string): Promise<string> => {
          return await this.keyPointsExtraction(
            chunk,
            this.getMaxTokensForSummary(chunks.length),
          );
        }),
      );
      return keyPoints
        .map((keyPoint: string): string[] => keyPoint.split('\n'))
        .flat()
        .map((keyPoint: string): string => keyPoint.replace('- ', '').trim());
    } catch (err) {
      return [];
    }
  }

  private async saveToFile(response: string[]): Promise<void> {
    await fs.writeFile('output.txt', response.join('\n'));
  }

  async getUserViolatedTerms(
    terms: string[],
    userTerms: UserTerm[],
  ): Promise<UserTerm[]> {
    const violatedTermsIds: number[] = await this.violatedTerms(
      terms,
      userTerms,
    );
    return this.mapIdsToTerms(violatedTermsIds, userTerms);
  }

  private mapIdsToTerms(ids: number[], userTerms: UserTerm[]): UserTerm[] {
    return ids.map((id: number): UserTerm => {
      return userTerms.find((term: UserTerm): boolean => term.id === id);
    });
  }

  splitIntoChunks(content: string): string[] {
    const { text }: { text: string[] } = this.tokenizer.encode(content);

    const result: string[] = [];

    for (let i = 0; i < text.length; i += this.MAX_TOKENS) {
      const chunk: string = text.slice(i, i + this.MAX_TOKENS).join('');
      result.push(chunk);
    }

    return result;
  }

  async getTermRank(term: string): Promise<number> {
    const response: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: process.env.OPENAI_VIOLAIONS_MODEL,
        messages: [
          {
            role: 'user',
            content: term + process.env.OPENAI_RANKING_RESPONSE,
          },
        ],
      });
    return +response.choices.at(0).message.content;
  }

  async rephraseTerm(title: string): Promise<string> {
    const response: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: process.env.OPENAI_VIOLAIONS_MODEL,
        messages: [
          {
            role: 'system',
            content: process.env.OPENAI_REPHRASE_RESPONSE,
          },
          {
            role: 'user',
            content: title,
          },
        ],
      });
    return response.choices.at(0).message.content.trim();
  }
}
