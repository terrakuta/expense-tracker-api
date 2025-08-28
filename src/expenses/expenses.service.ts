import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { ExpensesEntity } from './entities/expenses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpensesDto } from '../dto/expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(ExpensesEntity) private readonly expensesRepository: Repository<ExpensesEntity>) {
  }

  async findAll(): Promise<ExpensesEntity[]> {
    return this.expensesRepository.find();
  }

  async create(dto: CreateExpensesDto): Promise<ExpensesEntity> {
    const expense = this.expensesRepository.create(dto);
    return this.expensesRepository.save(expense);
  }

  async findById(id: string): Promise<ExpensesEntity> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
    });

    if (!expense) throw new NotFoundException('Запись не найдена');
    return expense;
  }

  async delete(id: string): Promise<string> {
    const deleteById = await this.findById(id);
    await this.expensesRepository.remove(deleteById);
    return deleteById.id;
  }

  async update(id: string, dto: CreateExpensesDto): Promise<boolean> {
    const updateById = await this.findById(id);
    Object.assign(updateById, dto);
    await this.expensesRepository.save(updateById);
    return true;
  }

  async getSummary(): Promise<{ total: number }> {
    const expenses = await this.expensesRepository.find();
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { total };
  }

  async getMonthlySummary(month: number): Promise<ExpensesEntity[]> {
    const now = new Date();
    const year = now.getFullYear();

    const startDate = new Date(year, month - 1, 1, 0, 0, 0); // month -1 = месяца это массив, где 0 элемент это январь
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await this.expensesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    if (!expenses || expenses.length === 0) {
      throw new Error('Записи не найдены');
    }
    return expenses;
  }
}