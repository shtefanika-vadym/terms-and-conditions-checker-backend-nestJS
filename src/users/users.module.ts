import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Md5Service } from 'src/md5/md5.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, Md5Service],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
