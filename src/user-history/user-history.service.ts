import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHistory } from 'src/user-history/user-history.model';

@Injectable()
export class UserHistoryService {
  constructor(
    @InjectRepository(UserHistory)
    private userHistoryRepository: Repository<UserHistory>,
  ) {}

  async getUserHistory(id: number): Promise<UserHistory[]> {
    return await this.userHistoryRepository.find({
      where: {
        user_id: id,
      },
      relations: ['site'],
      select: {
        id: true,
        site: {
          terms: true,
          site_url: true,
          terms_url: true,
        },
      },
    });
  }

  async create(userId: number, siteId: number): Promise<void> {
    const history: UserHistory = new UserHistory();
    history.site_id = siteId;
    history.user_id = userId;

    await this.userHistoryRepository.save(history);
  }

  async checkHasAnalysis(
    userId: number,
    url: string,
  ): Promise<{ hasAnalysis: boolean }> {
    const history: UserHistory | undefined =
      await this.userHistoryRepository.findOne({
        where: {
          user_id: userId,
          site: {
            site_url: url,
          },
        },
      });
    return { hasAnalysis: Boolean(history) };
  }
}
