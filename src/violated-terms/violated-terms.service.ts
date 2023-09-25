import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { UserTerm } from 'src/user-terms/user-terms.model';

@Injectable()
export class ViolatedTermsService {
  constructor(
    @InjectRepository(ViolatedTerm)
    private violatedTermRepository: Repository<ViolatedTerm>,
    private siteTermsService: SiteTermsService,
  ) {}

  async create(
    userId: number,
    site: string,
    terms: UserTerm[],
    fingerprint: string,
  ): Promise<void> {
    const term: ViolatedTerm = new ViolatedTerm();
    term.user_id = userId;
    term.site = site;
    term.terms = terms;
    term.fingerprint = fingerprint;

    this.violatedTermRepository.save(term);
  }
}
