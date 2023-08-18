import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { mockUserRepositoryFactory } from '../../user/test/mock/mock_user_repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
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
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepositoryFactory(users),
        },
        {
          provide: JwtService,
          useValue: {
            sign: () => 'accessToken',
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

    (bcrypt.genSalt as jest.Mock) = jest.fn().mockReturnValue(10);
    (bcrypt.compare as jest.Mock) = jest.fn().mockReturnValue(true);

    jest
      .spyOn(userService, 'findUsername')
      .mockImplementation(async (username) =>
        users.find((user) => user.name === username),
      );
  });

  describe('when validate a user', () => {
    describe('if username and password is correct', () => {
      it('return a User Entity without password', async () => {
        const result = await authService.validateUser(
          'test1',
          'hashedPassword1',
        );
        expect(result).toStrictEqual({
          id: '001',
          name: 'test1',
          email: 'test1@example.com',
        });
      });
    });
    describe('if either username and password is wrong', () => {
      it('return null', async () => {
        const result = await authService.validateUser('test1', 'somePassword');
        expect(result).toBeNull;
      });
    });
  });

  describe('when login ', () => {
    describe('since it was validated by Passport', () => {
      it('return an access token', async () => {
        const result = await authService.login(users[0]);
        expect(result).toStrictEqual({
          access_token: 'accessToken',
        });
      });
    });
  });
});
