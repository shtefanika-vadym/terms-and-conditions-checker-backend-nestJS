import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserTermsService } from 'src/user-terms/user-terms.service';
import { UserId } from 'src/auth/user-id.decorator';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { MessageResponse } from 'src/response/message-response';
import { CreateUserTermDto } from 'src/user-terms/dto/create-user-term.dto';

@UseGuards(JwtAuthGuard)
@Controller('user-terms')
export class UserTermsController {
  constructor(private userTermsService: UserTermsService) {}

  @Get()
  async getUserTerms(@UserId() userId: number): Promise<UserTerm[]> {
    return this.userTermsService.getTermsByUserId(userId);
  }

  @Post()
  async createUserTerm(
    @UserId() userId: number,
    @Body() termDto: CreateUserTermDto,
  ): Promise<MessageResponse> {
    return this.userTermsService.createUserTerm(userId, termDto);
  }

  @Get('/identify-violated')
  async identifyViolatedTerms(
    @UserId() userId: number,
    @Query('site') site: string,
  ): Promise<UserTerm[]> {
    return this.userTermsService.identifyViolatedTerms(userId, site);
  }

  @Post('/rephrase')
  async rephrase(@Body() dto: CreateUserTermDto): Promise<CreateUserTermDto> {
    return this.userTermsService.rephrase(dto);
  }
}
