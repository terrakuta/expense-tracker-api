import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/users.entity';
import { Account } from './entities/accounts.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import type { JwtPayload } from './interfaces/jwt.interface';
import type { Response } from 'express';
import type { Request } from 'express';
import { isDev } from '../utils/is-dev.util';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });
    return { accessToken, refreshToken };
  }

  async register(res: Response, dto: RegisterDto) {
    const { email, password, username } = dto;

    const existUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existUser) {
      throw new ConflictException('User already exists');
    }
    const user = await this.userRepo.create({
      email,
      password: await hash(password),
      username,
    });
    await this.userRepo.save(user);

    const account = this.accountsRepo.create({
      provider: 'local',
      providerId: user.id,
      user: user,
    });
    await this.accountsRepo.save(account);

    user.account = account;

    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginDto) {
    const { username, password } = dto;

    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['account'],
      select: ['id', 'username', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User does not exists');
    }
    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('User does not exists');
    }
    return this.auth(res, user.id);
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);
    this.setCookie(res, refreshToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    return { accessToken };
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));
    return { message: 'Logged out' };
  }

  async validate(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['account'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      expires,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
      domain: this.COOKIE_DOMAIN,
    });
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const user = await this.userRepo.findOne({
        where: { id: payload.id },
        select: ['id'],
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.auth(res, user.id);
    }
  }
}
