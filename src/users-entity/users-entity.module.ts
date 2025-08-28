import { Module } from '@nestjs/common';
import { UsersEntityService } from './users-entity.service';
import { UsersEntityController } from './users-entity.controller';

@Module({
  controllers: [UsersEntityController],
  providers: [UsersEntityService],
})
export class UsersEntityModule {}

