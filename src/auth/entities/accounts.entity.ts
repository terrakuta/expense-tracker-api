import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './users.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  provider: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @OneToOne(() => User, user => user.account)
  user: User;
}
