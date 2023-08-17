import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { getHashedString } from '../utils/getHashedString';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * this is function is used to create a new User Entity.
   * @param createUserDto the keys expected from body of request
   * @returns promise of user
   */
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await getHashedString(createUserDto.password);
    const createdUser = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    this.userRepository.save(createdUser);
    return { ...createdUser, password: undefined };
  }

  /**
   * this function is used to get all users' entities
   * @returns promise of array of user
   */
  findAll() {
    return this.userRepository.find();
  }

  /**
   * this function used to get data of a user whose id is passed in parameter
   * @param id is a string, which is the userId
   * @returns promise of user
   */
  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * this function is used to updated specific user whose id is passed in
   * parameter along with passed updated data
   * @param id is a string, which is the userId
   * @param updateUserDto this is partial type of createUserDto
   * @returns promise of updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOneBy({ id });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if the password needs to be updated
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await getHashedString(updateUserDto.password);
    } else {
      // Keep the existing password
      hashedPassword = existingUser.password;
    }

    // Update the user entity with the new data
    existingUser.name = updateUserDto.name;
    existingUser.email = updateUserDto.email;
    existingUser.password = hashedPassword;

    // Save the updated user entity
    this.userRepository.save(existingUser);
    return { ...existingUser, password: undefined };
  }

  /**
   * this function is used to remove a user from database.
   * @param id is a string, which is the userId
   * @returns number of rows deleted or affected
   */
  remove(id: string): Promise<{ affected?: number }> {
    return this.userRepository.delete(id);
  }
}
