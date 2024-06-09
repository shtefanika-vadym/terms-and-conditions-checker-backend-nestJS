import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserHistory } from 'src/user-history/user-history.model';
import { AnalyseStatus } from 'src/user-history/enums/analyse-status';

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
      order: {
        id: 'DESC',
      },
      relations: ['site', 'violated_term'],
      select: {
        id: true,
        site: {
          terms: true,
          site_url: true,
          terms_url: true,
        },
        violated_term: {
          terms: true,
        },
      },
    });
  }

  async create(
    userId: number,
    siteId: number,
    violatedTermId: number,
  ): Promise<void> {
    const history: UserHistory = new UserHistory();
    history.site_id = siteId;
    history.user_id = userId;
    history.violated_term_id = violatedTermId;

    await this.userHistoryRepository.save(history);
  }

  async checkStatus(
    userId: number,
    url: string,
  ): Promise<{ status: AnalyseStatus }> {
    const history: UserHistory | undefined =
      await this.userHistoryRepository.findOne({
        relations: ['site'],
        where: {
          user_id: userId,
          site: {
            site_url: url,
          },
        },
      });

    if (!history) return { status: AnalyseStatus.Unchecked };
    if (!history.site.terms.length) return { status: AnalyseStatus.Rejected };

    return { status: AnalyseStatus.Analysed };
  }
}
