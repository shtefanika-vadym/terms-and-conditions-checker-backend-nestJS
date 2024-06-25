import { IsString, Length } from 'class-validator';

export class CreateUserTermDto {
  @IsString({ message: 'Term title must be a string' })
  // @Length(4, 255, {
  //   message: 'Term title must be between 4 and 255 characters',
  // })
  readonly title: string;
}
