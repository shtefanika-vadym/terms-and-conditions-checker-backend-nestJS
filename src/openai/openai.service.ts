import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import OpenAI from 'openai';
import GPT3Tokenizer from 'gpt3-tokenizer';

@Injectable()
export class OpenAIService {
  private readonly model: string = 'gpt-3.5-turbo-16k';
  private readonly MAX_TOKENS: number = 16384;
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
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a competent artificial intelligence, specializing in distilling information into key points and summarizing. Based on the text below, identify and list the main points from the terms and conditions presented. These should be the most important, crucial to the gist of the discussion. Your aim is to provide a list that includes all terms and conditions in a summarised format. The answer should not exceed ${maxSummaryTokens} tokens.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });
    return response.choices.at(0).message.content.trim();
  }

  async differenceTS(text: string): Promise<any> {
    const response: OpenAI.Chat.ChatCompletion =
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Get a valid JSON array of objects terms and conditions that are violated by these site terms and conditions.`,
            // content: `You are a competent artificial intelligence, specializing in analyzing terms and conditions. The following is the site's terms and conditions: ${text}. Please identify and list the user terms and conditions that are violated by these site terms and conditions.
            // Each child object from user has a property named "id" and a property named "title".
            // The resulting JSON object should be in this format: [{"id":"number","title":"string"}]`,
          },
          {
            role: 'user',
            content: `Site terms and conditions: ${text}`,
          },
          {
            role: 'user',
            content: `User terms and conditions ${this.USER_TS}`,
          },
        ],
      });
    console.log(
      response.choices.at(0).message,
      // JSON.parse(response.choices.at(0).message.content),
    );
    return response.choices.at(0).message;
  }

  async getListPointsByChunks(chunks: string[]): Promise<string[]> {
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

  async callOpenAIApi(): Promise<string> {
    const text: string = await this.loadText('output.txt');
    await this.differenceTS(text);
    // const chunks: string[] = this.splitIntoChunks(text);
    //
    // const keyPoints: string[] = await this.getListPointsByChunks(chunks);
    // await this.saveToFile(keyPoints);

    return 'Done';
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
