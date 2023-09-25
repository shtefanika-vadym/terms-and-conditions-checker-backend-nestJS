import { forwardRef, Module } from '@nestjs/common';
import { UserTermsController } from './user-terms.controller';
import { UserTermsService } from './user-terms.service';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UserTermsController],
  providers: [UserTermsService],
  imports: [
    TypeOrmModule.forFeature([UserTerm]),
    forwardRef(() => AuthModule),
  ],
})
export class UserTermsModule {}
