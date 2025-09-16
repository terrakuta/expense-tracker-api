import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { Expenses } from './entities/expenses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpensesDto } from './dto/expenses.dto';
import { UsersService } from '../users/users.service';
import { CategoriesService } from './category.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expenses) private readonly expensesRepository: Repository<Expenses>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(userId: string, page = 1, limit = 10): Promise<Expenses[]> {
    const skip = (page - 1) * limit;

    return this.expensesRepository.find({
      where: { user: { id: userId } },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async create(dto: CreateExpensesDto, id: string): Promise<Expenses> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const { categoryId, ...expenseData } = dto;
    const category = await this.categoriesService.findByCategory(categoryId);

    const lastExpense = await this.expensesRepository.findOne({
      where: { user: { id: id } },
      order: { createdAt: 'DESC' },
    });

    const currentBalance = lastExpense ? Number(lastExpense.balanceAfter) : 0;
    const newBalance = dto.type === 'income' ? currentBalance + dto.amount : currentBalance - dto.amount;

    const expense = this.expensesRepository.create({
      ...expenseData,
      user,
      category,
      balanceAfter: newBalance,
    });
    return this.expensesRepository.save(expense);
  }

  async getCurrentBalance(userId: string): Promise<number> {
    const lastExpense = await this.expensesRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return lastExpense ? Number(lastExpense.balanceAfter) : 0;
  }

  async findById(id: string): Promise<Expenses> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
    });

    if (!expense) throw new NotFoundException('Expense not found');
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

  async getSummary(userId: string): Promise<{ total: number }> {
    const expenses = await this.expensesRepository.find({ where: { user: { id: userId } } });
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { total };
  }

  async getExpensesByCategory(сategoryId: string, userId: string): Promise<number> {
    const expenses = await this.expensesRepository.count({
      where: {
        user: { id: userId },
        category: { id: сategoryId },
      },
    });
    return expenses;
  }

  async getMonthlySummary(userId: string, start: string, end: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const expenses = await this.expensesRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDate, endDate),
        type: 'expense',
      },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    if (!expenses || expenses.length === 0) {
      throw new NotFoundException('expenses not found');
    }
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const expensesByCategory: Record<string, { category: string; totalExpenses: number }> = {};
    expenses.forEach(exp => {
      const id = exp.category?.id;
      const name = exp.category?.name || 'no category';
      if (id) {
        if (!expensesByCategory[id]) {
          expensesByCategory[id] = { category: name, totalExpenses: 0 };
        }
        expensesByCategory[id].totalExpenses += exp.amount;
      }
    });

    const topCategory = Object.values(expensesByCategory).reduce(
      (acc, curr) => (curr.totalExpenses > acc.totalExpenses ? curr : acc),
      { category: 'no data', totalExpenses: 0 },
    );

    const expensesByDay: Record<string, number> = {};

    expenses.forEach(exp => {
      const dayKey = exp.createdAt.toISOString().split('T')[0];
      expensesByDay[dayKey] = (expensesByDay[dayKey] || 0) + exp.amount;
    });

    return {
      total,
      topCategory: {
        name: topCategory.category,
        totalExpenses: topCategory.totalExpenses,
      },
      expensesByDay,
    };
  }
}
