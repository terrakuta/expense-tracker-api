import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors, UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './dto/updateUser.dto';
import type { userIdReq } from '../common/interfaces/userIdReq.interface';


@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true, transform: true}))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('update')
  async update(@Req() req: userIdReq, @Body() dto: updateUserDto) {
    const updatedUser = await this.usersService.update(req.user.id, dto);
    return { message: 'User updated successfully', updatedUser: updatedUser };
  }
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './common/uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: userIdReq) {
    return this.usersService.saveAvatar(req.user.id, file.filename);
  }
}
