import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/users.entity';
import { Category } from './category.entity';

@Entity()
export class Expenses {
  @PrimaryColumn()
  @Generated('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'int',
  })
  amount: number;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Column('decimal', { default: 0 })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Category, category => category.expenses, { nullable: true })
  category?: Category | null;
}
