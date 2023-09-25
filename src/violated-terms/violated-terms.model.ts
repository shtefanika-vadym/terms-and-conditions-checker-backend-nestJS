import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/users.model';
import { UserTerm } from 'src/user-terms/user-terms.model';

@Entity({ name: 'violated_terms' })
export class ViolatedTerm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  user_id: number;

  @ManyToOne(() => User, (user: User) => user)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: false })
  user_fingerprint: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  site: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  site_fingerprint: string;

  @Column({ type: 'json', nullable: true })
  terms: UserTerm[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
