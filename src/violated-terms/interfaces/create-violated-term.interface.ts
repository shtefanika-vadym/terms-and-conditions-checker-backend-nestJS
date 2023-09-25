import { UserTerm } from 'src/user-terms/user-terms.model';

export interface ICreateViolatedTerm {
  site: string;
  userId: number;
  terms: UserTerm[];
  siteFingerprint: string;
}
