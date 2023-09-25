import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViolatedTerm } from 'src/violated-terms/violated-terms.model';
import { SiteTermsService } from 'src/site-terms/site-terms.service';
import { ICreateViolatedTerm } from 'src/violated-terms/interfaces/create-violated-term.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ViolatedTermsService {
  constructor(
    @InjectRepository(ViolatedTerm)
    private violatedTermRepository: Repository<ViolatedTerm>,
    private siteTermsService: SiteTermsService,
    private userService: UsersService,
  ) {}

  async create({
    userId,
    site,
    terms,
    siteFingerprint,
  }: ICreateViolatedTerm): Promise<void> {
    const userFingerprint: string =
      await this.userService.getUserFingerprint(userId);
    const term: ViolatedTerm = new ViolatedTerm();
    term.user_id = userId;
    term.site = site;
    term.terms = terms;
    term.user_fingerprint = userFingerprint;
    term.site_fingerprint = siteFingerprint;

    this.violatedTermRepository.save(term);
  }

  async getLastViolatedTerm(site: string): Promise<ViolatedTerm> {
    return this.violatedTermRepository.findOne({
      where: {
        site,
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
