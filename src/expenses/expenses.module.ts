import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesEntity } from './entities/expenses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpensesEntity])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
