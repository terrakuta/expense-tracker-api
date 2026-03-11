import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/category.dto';
import { ExpensesService } from './expenses.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject(forwardRef(() => ExpensesService))
    private readonly expensesService: ExpensesService,
    private readonly usersService: UsersService,
  ) {}

  async createCategory(id: string, dto: CreateCategoryDto) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.categoryRepo.findOne({
      where: { user: { id }, name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Category already exists');
    }
    const category = this.categoryRepo.create({ ...dto, user });

    return this.categoryRepo.save(category);
  }

  async getUserCategories(id: string) {
    const categories = await this.categoryRepo.find({ where: { user: { id } } });

    const categoriesTotalExpenses = await Promise.all(
      categories.map(async category => {
        const totalExpenses = await this.expensesService.getExpensesByCategory(category.id, id);
        return {
          id: category.id,
          name: category.name,
          totalExpenses,
        };
      }),
    );
    return { categoriesTotalExpenses };
  }

  async findByCategory(categoryId: string): Promise<Category | null> {
    if (!categoryId) return null;
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
