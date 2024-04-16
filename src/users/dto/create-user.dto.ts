import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @MaxLength(255, {
    message: 'Email must be shorter than or equal to 255 characters',
  })
  readonly email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(16, {
    message: 'Password must be shorter than or equal to 16 characters',
  })
  readonly password: string;
}
