import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true, transform: true}))
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out' };
  }

  @Get('@me')
  @HttpCode(HttpStatus.OK)
  async CurrentUser(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      return null;
    }
    return this.authService.validate(userId);
  }
}
