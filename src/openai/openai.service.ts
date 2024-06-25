import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';
import * as process from 'process';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { ConfigService } from '@nestjs/config';
import { PromptService } from 'src/prompt/prompt.service';
import Instructor, { InstructorClient } from '@instructor-ai/instructor';
import { RephraseResponse } from 'src/user-terms/response/rephrase-response';
import { RankTermResponse } from 'src/user-terms/response/rank-term-response';
import { ViolationTermResponse } from 'src/user-terms/response/violation-term-response';
import { KeyPointsResponse } from 'src/user-terms/response/key-points-response';
import { Prompt } from 'src/prompt/intrerfaces/prompt.interface';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly MAX_TOKENS: number;
  private readonly tokenizer: GPT3Tokenizer;
  private readonly client: InstructorClient<OpenAI>;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: PromptService,
  ) {
    this.MAX_TOKENS = +this.configService.get<string>('OPENAI_MAX_TOKENS');
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_KEY'),
      organization: this.configService.get<string>('OPENAI_ORGANIZATION_ID'),
    });
    this.client = Instructor({
      mode: 'TOOLS',
      client: this.openai,
    });

    this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  }

  async loadText(file_path: string): Promise<string> {
    return await fs.readFile(file_path, 'utf-8');
  }

  private getMaxTokensForSummary(chunksLength: number): number {
    return Math.floor(this.MAX_TOKENS / chunksLength);
  }

  private async generateModelResponse<T>(prompt: Prompt): Promise<T> {
    const { messages, schema } = prompt;
    const openAiModel = this.configService.get<string>('OPENAI_MODEL');

    const { _meta, ...rest } = await this.client.chat.completions.create({
      max_retries: 2,
      model: openAiModel,
      messages: messages,
      response_model: {
        schema: schema,
        name: 'generateModelResponse',
      },
    });
    console.log(_meta.usage);
    return rest as T;
  }

  private async keyPointsExtraction(siteTerms: string): Promise<string[]> {
    const prompt: Prompt = this.promptService.keyPointsPrompt(siteTerms);

    const { terms } =
      await this.generateModelResponse<KeyPointsResponse>(prompt);

    if (!terms.length) {
      console.log('No terms found.');
      throw new Error(process.env.OPENAI_NO_TERMS_FOUND);
    }
    return terms;
  }

  private async violatedTerms(
    terms: string[],
    userTerms: UserTerm[],
  ): Promise<number[]> {
    const prompt: Prompt = this.promptService.violationPrompt(terms, userTerms);

    const { violatedTerms } =
      await this.generateModelResponse<ViolationTermResponse>(prompt);
    return violatedTerms;
  }

  async listPointsByChunks(chunks: string[]): Promise<string[]> {
    try {
      const keyPoints: string[][] = await Promise.all(
        chunks.map(async (chunk: string): Promise<string[]> => {
          return await this.keyPointsExtraction(chunk);
        }),
      );
      return keyPoints.flat();
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

  async getTermRank(term: string): Promise<RankTermResponse> {
    const prompt: Prompt = this.promptService.rankPrompt(term);
    return this.generateModelResponse<RankTermResponse>(prompt);
  }

  async rephraseTerm(term: string): Promise<RephraseResponse> {
    const prompt: Prompt = this.promptService.rephrasePrompt(term);
    return this.generateModelResponse<RephraseResponse>(prompt);
  }
}
