import { Injectable } from '@nestjs/common';
import { MessageResponse } from 'src/response/message-response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteTerms } from 'src/site-terms/site-terms.model';

@Injectable()
export class SiteTermsService {
  constructor(
    @InjectRepository(SiteTerms)
    private siteTermsRepository: Repository<SiteTerms>,
  ) {}

  async create(dto): Promise<MessageResponse> {
    return {
      message: 'Thanks! We will contact you shortly',
    };
  }
}
