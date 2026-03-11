import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/users.entity';
import { Repository } from 'typeorm';
import { hash } from 'argon2';
import { RegisterDto } from '../auth/dto/register.dto';
import { updateUserDto } from './dto/updateUser.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async update(id: string, dto: updateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (dto.username) {
      user.username = dto.username;
    }

    if (dto.email) {
      user.email = dto.email;
    }

    if (dto.password) {
      user.password = await hash(dto.password);
    }

    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return this.userRepo.findOne({
      where: { username },
    });
  }

  async createBy(dto: RegisterDto): Promise<User> {
    const { email, password, username } = dto;
    const user = await this.userRepo.create({
      email,
      password: await hash(password),
      username,
    });
    return await this.userRepo.save(user);
  }

  async saveAvatar(userId: string, filename: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.avatarPath = `/uploads/avatars/${filename}`;
    return this.userRepo.save(user);
  }
}
