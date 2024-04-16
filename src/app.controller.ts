import { Controller, Get, Post } from "@nestjs/common";

@Controller()
export class AppController {
  constructor() {}

  @Get()
  async getHello(): Promise<string> {
    return 'Text processing complete!';
  }

  @Post()
  async fd(): Promise<string> {
    return 'Text processing complete!';
  }
}
