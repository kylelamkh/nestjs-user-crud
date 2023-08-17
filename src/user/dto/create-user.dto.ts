import {
  IsEmail,
  IsAlphanumeric,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlphanumeric('en-US', {
    message: 'Username only allow alphanumeric characters.',
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Please provide valid email.' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
