import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { Prompt } from 'src/prompt/intrerfaces/prompt.interface';
import { Rank } from 'src/user-terms/response/rank-term-response';

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

  rephrasePrompt(term: string): Prompt {
    const prompt: string = this.configService.get<string>(
      'OPENAI_REPHRASE_PROMPT',
    );
    const schema = z
      .object({
        rephrase: z
          .string()
          .describe(
            this.configService.get<string>('REPHRASE_SCHEMA_DESCRIPTION'),
          ),
        isBlocked: z
          .boolean()
          .describe(
            this.configService.get<string>('IS_BLOCKED_SCHEMA_DESCRIPTION'),
          ),
      })
      .transform((result) => {
        if (result.isBlocked) {
          return { ...result, rephrase: '' };
        }
        return result;
      });
    const messages: ChatCompletionMessageParam[] =
      this.generatePromptMessageParams(prompt, { term });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return { messages, schema };
  }

  rankPrompt(term: string): Prompt {
    const prompt: string = this.configService.get<string>('OPENAI_RANK_PROMPT');
    const messages: ChatCompletionMessageParam[] =
      this.generatePromptMessageParams(prompt, { term });
    const schema = z.object({
      rank: z
        .nativeEnum(Rank)
        .describe(this.configService.get<string>('RANK_SCHEMA_DESCRIPTION')),
    });

    return { messages, schema };
  }

  violationPrompt(siteTerms: string[], userTerms: UserTerm[]): Prompt {
    const prompt: string = this.configService.get<string>(
      'OPENAI_VIOLATION_PROMPT',
    );
    const messages: ChatCompletionMessageParam[] =
      this.generatePromptMessageParams(prompt, { siteTerms, userTerms });

    // Extract user term IDs and create an enum
    const userTermIds = userTerms.map((term: UserTerm) => term.id);
    const UserTermIdEnum = z.enum(
      userTermIds.map(String) as [string, ...string[]],
    );
    const schema = z.object({
      violatedTerms: z.array(
        UserTermIdEnum.transform(Number)
          .optional()
          .describe(
            this.configService.get<string>('VIOLATION_SCHEMA_DESCRIPTION'),
          ),
      ),
    });

    return { messages, schema };
  }

  keyPointsPrompt(siteTerms: string): Prompt {
    const prompt: string = this.configService.get<string>(
      'OPENAI_KEY_POINTS_PROMPT',
    );
    const messages: ChatCompletionMessageParam[] =
      this.generatePromptMessageParams(prompt, { siteTerms });

    const schema = z.object({
      terms: z.array(
        z
          .string()
          .describe(
            this.configService.get<string>('KEY_POINTS_SCHEMA_DESCRIPTION'),
          ),
      ),
    });

    return { messages, schema };
  }
}
