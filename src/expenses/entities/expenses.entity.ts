import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/users.entity';

@Entity()
export class ExpensesEntity {
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

  @Column({
    type: 'date',
    nullable: true,
  })
  expenseDate: Date;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  user: User;
}
