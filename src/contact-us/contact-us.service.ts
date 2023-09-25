import { Injectable } from '@nestjs/common';
import { CreateContactDto } from 'src/contact-us/dto/create-contact.dto';
import { ContactUs } from 'src/contact-us/contact-us.model';
import { MessageResponse } from 'src/response/message-response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private contactUsRepository: Repository<ContactUs>,
  ) {}

  async create(dto: CreateContactDto): Promise<MessageResponse> {
    await this.contactUsRepository.create(dto);
    return {
      message: 'Thanks! We will contact you shortly',
    };
  }

  async getAll(): Promise<ContactUs[]> {
    return this.contactUsRepository.find({
      select: ['id', 'name', 'email', 'message'],
    });
  }
}
