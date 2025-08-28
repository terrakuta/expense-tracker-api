import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}