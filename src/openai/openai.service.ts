import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';
import * as process from 'process';

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
    const fileContent = await fs.readFile(file_path, 'utf-8');
    return fileContent;
  }

  getMaxTokensForSummary(chunksLength: number): number {
    return Math.floor(this.MAX_TOKENS / chunksLength);
  }

  async keyPointsExtraction(
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
            content: text,
          },
        ],
      });
    return response.choices.at(0).message.content.trim();
  }

  async getUserViolatedTerms(
    terms: string[],
    userTerms: any[],
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
    const keyPoints: string[] = await Promise.all(
      chunks.map(async (chunk: string): Promise<string> => {
        return await this.keyPointsExtraction(
          chunk,
          this.getMaxTokensForSummary(chunks.length),
        );
      }),
    );
    return keyPoints;
  }

  async saveToFile(response: string[]): Promise<void> {
    await fs.writeFile('output.txt', response.join('\n'));
  }

  async callOpenAIApi(siteTerms: string, userTerms: any[]): Promise<number[]> {
    // const terms: string = await this.loadText('output.txt');

    const chunks: string[] = this.splitIntoChunks(siteTerms);
    const termsKeyPoints: string[] = await this.listPointsByChunks(chunks);
    const violatedTermsIds: number[] = await this.getUserViolatedTerms(
      termsKeyPoints,
      userTerms,
    );
    return violatedTermsIds;
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
}
