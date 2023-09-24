import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;

  @IsString({ message: 'Password must be a string' })
  @Length(4, 16, { message: 'Password must be between 4 and 16 characters' })
  readonly password: string;
}
