import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserTermsService } from 'src/user-terms/user-terms.service';
import { UserId } from 'src/auth/user-id.decorator';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { MessageResponse } from 'src/response/message-response';
import { CreateUserTermDto } from 'src/user-terms/dto/create-user-term.dto';
import { RephraseResponse } from 'src/user-terms/response/rephrase-response';

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

  @Delete()
  async deleteUserTerm(
    @UserId() userId: number,
    @Query('id') id: number,
  ): Promise<MessageResponse> {
    return this.userTermsService.deleteUserTerm(userId, id);
  }

  @Post('/identify-violated')
  async checkForTermsViolations(
    @UserId() userId: number,
    @Query('site') site: string,
  ): Promise<UserTerm[]> {
    return this.userTermsService.checkForTermsViolations(userId, site);
  }

  @Post('/rephrase')
  async rephrase(@Body() dto: CreateUserTermDto): Promise<RephraseResponse> {
    return this.userTermsService.rephrase(dto);
  }
}
