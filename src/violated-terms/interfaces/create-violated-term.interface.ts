import { UserTerm } from 'src/user-terms/user-terms.model';

export interface ICreateViolatedTerm {
  url: string;
  userId: number;
  terms: UserTerm[];
  siteFingerprint: string;
}
