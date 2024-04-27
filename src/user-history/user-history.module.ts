import { forwardRef, Module } from '@nestjs/common';
import { UserHistoryService } from './user-history.service';
import { UserHistoryController } from './user-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserHistory } from 'src/user-history/user-history.model';

@Module({
  controllers: [UserHistoryController],
  providers: [UserHistoryService],
  imports: [
    TypeOrmModule.forFeature([UserHistory]),
    forwardRef(() => AuthModule),
  ],
})
export class UserHistoryModule {}
