import { ApiProperty } from '@nestjs/swagger';

export class LoginBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;
}
