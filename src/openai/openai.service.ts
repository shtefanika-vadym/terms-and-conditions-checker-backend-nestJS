import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';
import * as process from 'process';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { ConfigService } from '@nestjs/config';
import { PromptService } from 'src/prompt/prompt.service';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';
import { RephraseResponse } from 'src/user-terms/response/rephrase-response';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly MAX_TOKENS: number;
  private readonly tokenizer: GPT3Tokenizer;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: PromptService,
  ) {
    this.MAX_TOKENS = +this.configService.get<string>('OPENAI_MAX_TOKENS');
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_KEY'),
    });
    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  }

  async loadText(file_path: string): Promise<string> {
    return await fs.readFile(file_path, 'utf-8');
  }

  private getMaxTokensForSummary(chunksLength: number): number {
    return Math.floor(this.MAX_TOKENS / chunksLength);
  }

  private async generateModelResponse<T>(
    messages: ChatCompletionMessageParam[],
  ): Promise<T> {
    const openAiModel = this.configService.get<string>('OPENAI_MODEL');
    const { choices } = await this.openai.chat.completions.create({
      messages,
      model: openAiModel,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(choices[0].message.content) as T;
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
    console.log('befre');
    console.log(userTerms, 'userTerms', JSON.stringify(userTerms));
    console.log('afte');
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
    console.log(response.choices.at(0).message.content, 'here w eare');
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

  async rephraseTerm(term: string): Promise<RephraseResponse> {
    const messages: ChatCompletionMessageParam[] =
      this.promptService.rephrasePrompt(term);

    return this.generateModelResponse<RephraseResponse>(messages);
  }
}
