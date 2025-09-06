import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesEntity } from './entities/expenses.entity';
import { User } from '../auth/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpensesEntity, User])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
