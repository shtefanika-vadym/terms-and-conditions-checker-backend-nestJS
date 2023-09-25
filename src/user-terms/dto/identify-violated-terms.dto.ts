import { IsString, Length } from 'class-validator';

export class IdentifyViolatedTermsDto {
  @IsString({ message: 'Site must be a string' })
  @Length(4, 255, {
    message: 'Site must be between 4 and 255 characters',
  })
  readonly site: string;
}
