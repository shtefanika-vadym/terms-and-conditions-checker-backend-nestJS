import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserTermsService } from 'src/user-terms/user-terms.service';
import { UserId } from 'src/auth/user-id.decorator';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { MessageResponse } from 'src/response/message-response';
import { CreateUserTermDto } from 'src/user-terms/dto/create-user-term.dto';
import { IdentifyViolatedTermsDto } from 'src/user-terms/dto/identify-violated-terms.dto';

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

  @Post('/identify-violated')
  async identifyViolatedTerms(
    @UserId() userId: number,
    @Body() { site }: IdentifyViolatedTermsDto,
  ): Promise<any> {
    return this.userTermsService.identifyViolatedTerms(userId, site);
  }
}
