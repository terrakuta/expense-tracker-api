import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from '../dto/expenses.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('summary')
  async getSummary() {
    return this.expensesService.getSummary();
  }

  @Get('findAll')
  async findAll(){
    return this.expensesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateExpensesDto) {
    return this.expensesService.create(dto);
  }

  @Get('GetID/:id')
  findById(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @Delete('Delete/:id')
  deleteId(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }
  @Put('Put/:id')
  update(@Param('id') id: string, @Body() dto: CreateExpensesDto) {
    return this.expensesService.update(id, dto);
  }
  @Get('month/:month')
  sortByMonth(@Param('month') month: string) {
    return this.expensesService.getMonthlySummary(Number(month));
  }
}
