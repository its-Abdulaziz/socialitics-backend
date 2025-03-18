import { Module } from '@nestjs/common';
import { TwitterConnService } from './twitter-conn.service';
import { TwitterConnController } from './twitter-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterConn } from './entities/twitter-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterConn, User]), UserModule, FirebaseModule],
  controllers: [TwitterConnController],
  providers: [TwitterConnService],
})
export class TwitterConnModule {}
