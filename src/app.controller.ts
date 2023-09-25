import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  async getHello(): Promise<string> {
    return 'Text processing complete!';
  }
}
