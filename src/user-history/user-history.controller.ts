import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserId } from 'src/auth/user-id.decorator';
import { UserHistoryService } from './user-history.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserHistory } from 'src/user-history/user-history.model';
import { AnalyseStatus } from 'src/user-history/enums/analyse-status';

@UseGuards(JwtAuthGuard)
@Controller('user-history')
export class UserHistoryController {
  constructor(private readonly userHistoryService: UserHistoryService) {}

  @Get()
  getUserHistory(@UserId() userId: number): Promise<UserHistory[]> {
    return this.userHistoryService.getUserHistory(userId);
  }

  @Get('/status')
  async checkStatus(
    @UserId() userId: number,
    @Query('site') site: string,
  ): Promise<{ status: AnalyseStatus }> {
    return this.userHistoryService.checkStatus(userId, site);
  }
}
