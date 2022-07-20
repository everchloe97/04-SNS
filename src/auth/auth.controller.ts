import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from 'src/user/decorator/currenUser';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {
    return this;
  }

  @Post('/login')
  async getToken(@Body() input: LoginInput): Promise<string> {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );
    return this.authService.generateToken(user);
  }

  @Post('refreshToken')
  async refreshToken(@CurrentUser() user: User): Promise<string> {
    return this.authService.generateToken(user);
  }
}
