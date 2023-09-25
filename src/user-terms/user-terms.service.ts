import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTerm } from 'src/user-terms/user-terms.model';
import { CreateUserTermDto } from 'src/user-terms/dto/create-user-term.dto';
import { MessageResponse } from 'src/response/message-response';

@Injectable()
export class UserTermsService {
  constructor(
    @InjectRepository(UserTerm)
    private userTermsRepository: Repository<UserTerm>,
  ) {}

  getTermsByUserId(id: number): Promise<UserTerm[]> {
    return this.userTermsRepository.find({
      where: {
        id,
      },
    });
  }

  async createUserTerm(
    id: number,
    { title }: CreateUserTermDto,
  ): Promise<MessageResponse> {
    const userTerm: UserTerm = new UserTerm();
    userTerm.id = id;
    userTerm.title = title;

    await this.userTermsRepository.save(userTerm);

    return { message: 'Term created successfully' };
  }
}
