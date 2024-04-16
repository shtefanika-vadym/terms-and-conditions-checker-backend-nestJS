import { Body, Controller, Post } from '@nestjs/common';
import { MessageResponse } from 'src/response/message-response';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponse } from 'src/auth/response/login-response';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @Post('/register')
  register(@Body() userDto: CreateUserDto): Promise<LoginResponse> {
    return this.authService.register(userDto);
  }
}
