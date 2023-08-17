import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { mockUserRepositoryFactory } from './mock/mock_user_repository';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;

  let users: User[];

  beforeEach(async () => {
    users = [
      {
        id: '001',
        name: 'test1',
        email: 'test1@example.com',
        password: 'hashedPassword1',
      },
      {
        id: '002',
        name: 'test2',
        email: 'test2@example.com',
        password: 'hashedPassword2',
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepositoryFactory(users),
        },
      ],
    }).compile();

    (bcrypt.genSalt as jest.Mock) = jest.fn().mockReturnValue(10);
    (bcrypt.hash as jest.Mock) = jest.fn().mockReturnValue('hashedPassword');

    userService = module.get<UserService>(UserService);
  });

  describe('When creating new user', () => {
    it('should add the new user to DB and return it without the password', async () => {
      const newUser: User = {
        id: '003',
        email: 'test13@example.com',
        password: 'hashedPassword3',
        name: 'test3',
      };
      const usersResult = await userService.create(newUser);
      expect(usersResult).toStrictEqual({ ...newUser, password: undefined });
    });
  });

  describe('When getting all users', () => {
    it('should be return all users', async () => {
      const usersResult = await userService.findAll();
      expect(usersResult).toStrictEqual(users);
    });
  });

  describe('When getting a user', () => {
    describe('If the userId is matched', () => {
      it('should return a user', async () => {
        const userResult = await userService.findOne('001');
        expect(userResult).toStrictEqual(users[0]);
      });
    });
    describe('If the username is matched', () => {
      beforeEach(() => {
        jest
          .spyOn(userService, 'findUsername')
          .mockImplementation(async (name) =>
            users.find((user) => user.name === name),
          );
      });
      it('should return a user', async () => {
        const userResult = await userService.findUsername('test1');
        expect(userResult).toStrictEqual(users[0]);
      });
    });
    describe('If the userId is not matched', () => {
      it('should be return null', async () => {
        const userResult = await userService.findOne('');
        expect(userResult).toBeUndefined();
      });
    });
  });

  describe("When updating a user's info", () => {
    const updatedUser = {
      id: '001',
      name: 'updatedName',
      email: 'test1@example.com',
      password: 'hashedPassword1',
    };
    describe('If the user is found', () => {
      it("should update the user's info", async () => {
        const userResult = await userService.update('001', updatedUser);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = { ...updatedUser, password: undefined };
        expect(userResult).toStrictEqual(result);
      });
    });
    describe('If the user is not found', () => {
      it('should be throw exception', async () => {
        await expect(userService.update('', updatedUser)).rejects.toThrow(
          new NotFoundException('User not found'),
        );
      });
    });
  });

  describe('When deleting a user', () => {
    describe('If the userId is matched', () => {
      it('should delete a user and return affected row which should be 1', async () => {
        const userResult = await userService.remove('001');
        expect(userResult).toStrictEqual({ affected: 1 });
      });
    });
    describe('If the userId is not matched', () => {
      it('should return affected row which should be 0', async () => {
        const userResult = await userService.remove('');
        expect(userResult).toStrictEqual({ affected: 0 });
      });
    });
  });
});
