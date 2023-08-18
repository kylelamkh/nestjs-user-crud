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

jest.mock('bcrypt');

describe('UserController (e2e)', () => {
  let app: INestApplication;

  let userService: UserService;
  let jwtService: JwtService;

  let users: User[];

  let accessToken: string;

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
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepositoryFactory(users),
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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    (bcrypt.genSalt as jest.Mock) = jest.fn().mockReturnValue(10);
    (bcrypt.hash as jest.Mock) = jest.fn().mockReturnValue('hashedPassword');
    (bcrypt.compare as jest.Mock) = jest.fn().mockReturnValue(true);

    jest
      .spyOn(userService, 'findUsername')
      .mockImplementation(async (username) =>
        users.find((user) => user.name === username),
      );

    accessToken = jwtService.sign(
      { permissions: ['create:items'] },
      { secret: 'MOCK_STRING', expiresIn: '5m' },
    );

    await app.init();
  });

  describe('/user (GET)', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(users);
    });
    it('should throw 401 if not logged in', () => {
      return request(app.getHttpServer()).get('/user').expect(401);
    });
  });

  describe('/user/:id (GET)', () => {
    it('should return a specific users', () => {
      return request(app.getHttpServer())
        .get('/user/001')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(users[0]);
    });
    it('should throw 401 if not logged in', () => {
      return request(app.getHttpServer()).get('/user/001').expect(401);
    });
  });

  describe('/user (POST)', () => {
    describe('If all parameter is valid', () => {
      it('should create a new user', () => {
        const newUser = {
          name: 'test3',
          email: 'test13@example.com',
          password: 'test1234',
        };
        return request(app.getHttpServer())
          .post('/user')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(newUser)
          .expect(201);
      });
    });
    describe('If any parameter is not valid', () => {
      it('should return Bad Request', () => {
        const newUser = {
          name: 'test3!!!',
          email: 'test13example.com',
          password: '',
        };
        return request(app.getHttpServer())
          .post('/user')
          .set('Authorization', `Bearer ${accessToken}`)
          .query(newUser)
          .expect(400);
      });
    });
    it('should throw 401 if not logged in', () => {
      return request(app.getHttpServer()).post('/user').expect(401);
    });
  });

  describe('/user/:id (PATCH)', () => {
    const updatedUser = {
      id: '001',
      name: 'updatedName',
      email: 'test1@example.com',
      password: 'hashedPassword1',
    };
    describe('If the user is found', () => {
      beforeEach(() => {
        jest
          .spyOn(userService, 'update')
          .mockResolvedValueOnce({ ...updatedUser, password: undefined });
      });

      it("should update the user's info", async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...restUser } = updatedUser;
        return request(app.getHttpServer())
          .patch('/user/001')
          .set('Authorization', `Bearer ${accessToken}`)
          .query(updatedUser)
          .expect(200)
          .expect(restUser);
      });
    });
    describe('If the user is not found', () => {
      it('should receive 404', async () => {
        return request(app.getHttpServer())
          .patch('/user/000')
          .set('Authorization', `Bearer ${accessToken}`)
          .query(updatedUser)
          .expect(404);
      });
    });
    it('should throw 401 if not logged in', () => {
      return request(app.getHttpServer()).patch('/user/001').expect(401);
    });
  });

  describe('/user/:id (DELETE)', () => {
    describe('If the userId is matched', () => {
      it('should delete a user and return affected row which should be 1', async () => {
        return request(app.getHttpServer())
          .delete('/user/001')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect({ affected: 1 });
      });
    });
    describe('If the userId is not matched', () => {
      it('should return affected row which should be 0', async () => {
        return request(app.getHttpServer())
          .delete('/user/000')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect({ affected: 0 });
      });
    });
    it('should throw 401 if not logged in', () => {
      return request(app.getHttpServer()).delete('/user/001').expect(401);
    });
  });
});
