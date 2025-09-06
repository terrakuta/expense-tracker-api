import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from './dto/expenses.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/entities/users.entity';


@UseGuards(AuthGuard('jwt'))
@Controller('expenses')

export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('summary')
  async getSummary(@Req() req: Request & { user: User }) {
    return this.expensesService.getSummary(req.user.id);
  }

  @Get('findAll')
  async findAll(@Req() req: Request & { user: User }, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.expensesService.findAll(req.user.id, page, limit);
  }

  @Post('create')
  create(@Req() req: Request & { user: User }, @Body() dto: CreateExpensesDto) {
    return this.expensesService.create(dto, req.user.id);
  }

  @Get('findById/:id')
  findById(@Param('id') id: string) {
    return this.expensesService.findById(id);
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
  sortByMonth(@Query('start') start: string, @Query('end') end: string, @Req() req: Request & { user: User }, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.expensesService.getMonthlySummary(req.user.id, start, end, page, limit);
  }
}
