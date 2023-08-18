import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { mockUserRepositoryFactory } from '../src/user/test/mock/mock_user_repository';
import { UserController } from '../src/user/user.controller';
import * as bcrypt from 'bcrypt';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { MockJwtStrategy } from '../src/auth/test/mock/mock_jwt.strategy';
import { LocalStrategy } from '../src/auth/local.strategy';

jest.mock('bcrypt');

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'MOCK_STRING',
          signOptions: {
            expiresIn: '5m',
          },
        }),
      ],
      controllers: [UserController, AuthController],
      providers: [
        UserService,
        AuthService,
        LocalStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepositoryFactory(users),
        },
        {
          provide: JwtService,
          useValue: {
            sign: () => 'access_token',
          },
        },
        {
          provide: JwtStrategy,
          useClass: MockJwtStrategy,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userService = moduleFixture.get<UserService>(UserService);

    (bcrypt.genSalt as jest.Mock) = jest.fn().mockReturnValue(10);
    (bcrypt.hash as jest.Mock) = jest.fn().mockReturnValue('hashedPassword');
    (bcrypt.compare as jest.Mock) = jest.fn().mockReturnValue(true);

    jest
      .spyOn(userService, 'findUsername')
      .mockImplementation(async (username) =>
        users.find((user) => user.name === username),
      );

    await app.init();
  });

  describe('/auth/login (POST)', () => {
    it('should login the user if input is valid', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          name: 'test1',
          password: 'hashedPassword1',
        })
        .expect(201);
    });
    it('should throw 401 if user input not valid', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          name: 'no such user',
          password: 'hashedPassword1',
        })
        .expect(401);
    });
  });
});
