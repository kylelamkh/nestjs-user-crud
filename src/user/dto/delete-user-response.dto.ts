import { ApiProperty } from '@nestjs/swagger';

export class DeletedResponse {
  @ApiProperty()
  affected: number;
}
