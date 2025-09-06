import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { ExpensesEntity } from './entities/expenses.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpensesDto } from './dto/expenses.dto';
import { User } from '../auth/entities/users.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpensesEntity) private readonly expensesRepository: Repository<ExpensesEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(userId: string, page = 1, limit = 10): Promise<ExpensesEntity[]> {
    const skip = (page - 1) * limit;

    return this.expensesRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async create(dto: CreateExpensesDto, userId: string): Promise<ExpensesEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const expense = this.expensesRepository.create({
      ...dto,
      user,
    });
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

  async getSummary(userId: string): Promise<{ total: number }> {
    const expenses = await this.expensesRepository.find({where: { user: { id: userId } }});
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { total };
  }

  async getMonthlySummary(userId: string, start: string, end: string, page = 1, limit = 10): Promise<ExpensesEntity[]> {
    const skip = (page - 1) * limit;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const expenses = await this.expensesRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    if (!expenses || expenses.length === 0) {
      throw new NotFoundException('Записи не найдены');
    }
    return expenses;
  }
}
