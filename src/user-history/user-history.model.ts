import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/users.model';
import { SiteTerm } from 'src/site-terms/site-terms.model';

@Entity({ name: 'user_history' })
export class UserHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  user_id: number;

  @ManyToOne(() => User, (user: User) => user)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer', nullable: false })
  site_id: number;

  @ManyToOne(() => SiteTerm, (site: SiteTerm) => site)
  @JoinColumn({ name: 'site_id' })
  site: SiteTerm;
}
