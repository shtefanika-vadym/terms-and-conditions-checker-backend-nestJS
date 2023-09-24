import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthController } from 'src/auth/auth.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      signOptions: {
        expiresIn: '24h',
      },
      secret: process.env.PRIVATE_KEY || 'SECRET',
    }),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
