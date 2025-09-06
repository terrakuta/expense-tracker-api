import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ExpensesEntity } from '../expenses/entities/expenses.entity';
import { User } from '../auth/entities/users.entity';
import { Account } from '../auth/entities/accounts.entity';

export async function getTypeOrmConfig(configService: ConfigService): Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('POSTGRES_HOST'),
    port: configService.getOrThrow<number>('POSTGRES_PORT'),
    username: configService.getOrThrow<string>('POSTGRES_USER'),
    password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
    entities: [ExpensesEntity, User, Account],
    synchronize: true,
  };
}
