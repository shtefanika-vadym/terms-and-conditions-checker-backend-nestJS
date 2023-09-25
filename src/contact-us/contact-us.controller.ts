import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactUsService } from 'src/contact-us/contact-us.service';
import { CreateContactDto } from 'src/contact-us/dto/create-contact.dto';
import { ContactUs } from 'src/contact-us/contact-us.model';
import { MessageResponse } from 'src/response/message-response';

@Controller('contact-us')
export class ContactUsController {
  constructor(private contactUsService: ContactUsService) {}

  // Create contact us
  @Post()
  create(@Body() dto: CreateContactDto): Promise<MessageResponse> {
    return this.contactUsService.create(dto);
  }

  // Get all contact us
  @Get()
  getAll(): Promise<ContactUs[]> {
    return this.contactUsService.getAll();
  }
}
