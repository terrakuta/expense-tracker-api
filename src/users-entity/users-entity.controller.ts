import { Controller } from '@nestjs/common';
import { UsersEntityService } from './users-entity.service';

@Controller('users-entity')
export class UsersEntityController {
  constructor(private readonly usersEntityService: UsersEntityService) {}
}
