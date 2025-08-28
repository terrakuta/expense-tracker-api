import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpensesModule } from './expenses/expenses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/typeorm.config';
import { UsersEntityModule } from './users-entity/users-entity.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
  }), ExpensesModule, UsersEntityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
