import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Md5Service } from 'src/md5/md5.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private md5Service: Md5Service,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const users: User[] = await this.userRepository.find();
    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      relations: ['terms'],
    });
    return user;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const newUser: User = await this.userRepository.save(user);
    return newUser;
  }

  async updateUserFingerprint(userId: number): Promise<void> {
    const user: User = await this.getUserById(userId);
    const fingerprint: string = this.md5Service.calculateMd5Hash(user.terms);
    await this.userRepository.update(userId, {
      fingerprint,
    });
  }

  async getUserFingerprint(userId: number): Promise<string> {
    const user: User = await this.getUserById(userId);
    return user.fingerprint;
  }
}
