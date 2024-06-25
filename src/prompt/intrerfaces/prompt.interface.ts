import { AnyZodObject } from 'zod';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

export interface Prompt {
  schema: AnyZodObject;
  messages: ChatCompletionMessageParam[];
}
