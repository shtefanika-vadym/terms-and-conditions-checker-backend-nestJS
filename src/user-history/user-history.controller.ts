import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { UserHistoryService } from './user-history.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserHistory } from 'src/user-history/user-history.model';

@UseGuards(JwtAuthGuard)
@Controller('user-history')
export class UserHistoryController {
  constructor(private readonly userHistoryService: UserHistoryService) {}

  @Get()
  getUserHistory(@UserId() userId: number): Promise<UserHistory[]> {
    return this.userHistoryService.getUserHistory(userId);
  }

  @Get('/has-analysis')
  async checkHasAnalysis(
    @UserId() userId: number,
    @Query('site') site: string,
  ): Promise<{ hasAnalysis: boolean }> {
    return this.userHistoryService.checkHasAnalysis(userId, site);
  }
}
