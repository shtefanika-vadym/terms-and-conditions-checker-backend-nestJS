import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ITermsAndCondition } from 'src/site-terms/interfaces/terms-and-condition.interface';

@Entity({ name: 'site_terms' })
export class SiteTerm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  site_url: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  terms_url: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fingerprint: string;

  @Column({ type: 'json', nullable: true })
  terms: ITermsAndCondition[];

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
