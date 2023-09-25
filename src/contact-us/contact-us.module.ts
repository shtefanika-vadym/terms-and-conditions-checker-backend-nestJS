import { Module } from '@nestjs/common';
import { ContactUsController } from 'src/contact-us/contact-us.controller';
import { ContactUs } from 'src/contact-us/contact-us.model';
import { ContactUsService } from 'src/contact-us/contact-us.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ContactUsController],
  providers: [ContactUsService],
  imports: [TypeOrmModule.forFeature([ContactUs])],
  exports: [],
})
export class ContactUsModule {}
