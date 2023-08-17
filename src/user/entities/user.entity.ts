import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 30 })
  name: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 40 })
  email: string;

  @ApiProperty()
  @Column({ type: 'varchar' })
  password: string;
}
