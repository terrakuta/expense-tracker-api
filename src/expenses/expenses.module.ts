import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expenses } from './entities/expenses.entity';
import { User } from '../auth/entities/users.entity';
import { CategoriesService } from './category.service';
import { Category } from './entities/category.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expenses, User, Category]), UsersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, CategoriesService, UsersService],
})
export class ExpensesModule {}
