import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'contact_us' })
export class ContactUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  message: string;
}
