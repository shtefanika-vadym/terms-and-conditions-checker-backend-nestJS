import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(255, {
    message: 'Name must be shorter than or equal to 255 characters',
  })
  readonly name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email' })
  @MaxLength(255, {
    message: 'Email must be shorter than or equal to 255 characters',
  })
  readonly email: string;

  @IsString({ message: 'Message must be a string' })
  @MinLength(4, { message: 'Message must be at least 4 characters long' })
  @MaxLength(255, {
    message: 'Message must be shorter than or equal to 16 characters',
  })
  readonly message: string;
}
