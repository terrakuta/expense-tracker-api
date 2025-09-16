import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from './dto/expenses.dto';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './category.service';
import { CreateCategoryDto } from './dto/category.dto';
import type { userIdReq } from '../common/interfaces/userIdReq.interface';

@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true, transform: true}))
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post('categories')
  async createCategory(@Req() req: userIdReq, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(req.user.id, dto);
  }

  @Get('categories')
  async getCategories(@Req() req: userIdReq) {
    return this.categoriesService.getUserCategories(req.user.id);
  }

  @Get('summary')
  async getSummary(@Req() req: userIdReq) {
    return this.expensesService.getSummary(req.user.id);
  }

  @Get('findAll')
  async findAll(@Req() req: userIdReq, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.expensesService.findAll(req.user.id, page, limit);
  }

  @Post('create')
  create(@Req() req: userIdReq, @Body() dto: CreateExpensesDto) {
    return this.expensesService.create(dto, req.user.id);
  }

  @Get('findById/:id')
  findById(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @Get('getCurrentBalance')
  getCurrentBalance(@Req() req: userIdReq) {
    return this.expensesService.getCurrentBalance(req.user.id);
  }

  @Delete('deleteId/:id')
  deleteId(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() dto: CreateExpensesDto) {
    return this.expensesService.update(id, dto);
  }

  @Get('sortByMonth')
  sortByMonth(
    @Query('start') start: string,
    @Query('end') end: string,
    @Req()
    req: userIdReq,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.expensesService.getMonthlySummary(req.user.id, start, end, page, limit);
  }
}
