import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'floppy.db.elephantsql.com/nfortglu',
      port: 5432,
      username: 'nfortglu',
      password: '8iW65douwCVrZEwh7hJHmNKFXW9fRstI',
      entities: [],
      database: 'nfortglu',
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}