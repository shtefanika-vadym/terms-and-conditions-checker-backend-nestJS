import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private getChatContent(): string {
    const responseType: string =
      'Response should an array of IDs indicating violations of the terms and conditions. Without any additional text.';
    const inputData =
      'Site Terms: Users must be at least 18 years of age. User terms include the following:';
    const inputData1 = [
      { id: 1, title: 'Posilitatea sa folosesc pagina deoarece am 16 ani' },
    ];
    return inputData + JSON.stringify(inputData1) + responseType;
  }

  async getPageContent(): Promise<any> {
    const openai: OpenAI = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });

    try {
      const completion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          messages: [{ role: 'user', content: this.getChatContent() }],
          model: process.env.OPENAI_MODEL,
        });
      return JSON.parse(completion.choices.at(0).message.content);
    } catch (error) {
      console.error('Error fetching content from OpenAI:', error);
      throw error;
    }
  }
}
