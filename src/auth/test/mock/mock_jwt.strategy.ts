import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class MockJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: 'MOCK_STRING',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: unknown): unknown {
    return payload;
  }
}
