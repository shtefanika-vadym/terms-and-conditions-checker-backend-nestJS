import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

@Injectable()
export class PromptService {
  constructor(private readonly configService: ConfigService) {}

  private appendAnswerFormat(str: string): string {
    return `${str}. ${this.configService.get<string>('OPENAI_ANSWER_FORMAT')}`;
  }

  private generatePromptMessageParams(
    systemContent: string,
    userContent: object,
  ): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content: this.appendAnswerFormat(systemContent),
      },
      {
        role: 'user',
        content: JSON.stringify(userContent),
      },
    ];
  }

  rephrasePrompt(term: string): ChatCompletionMessageParam[] {
    const prompt: string = this.configService.get<string>(
      'OPENAI_REPHRASE_PROMPT',
    );
    return this.generatePromptMessageParams(prompt, { term });
  }
}
