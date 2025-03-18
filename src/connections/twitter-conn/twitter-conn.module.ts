import { Module } from '@nestjs/common';
import { TwitterConnService } from './twitter-conn.service';
import { TwitterConnController } from './twitter-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterConn } from './entities/twitter-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterConn]), UserModule, FirebaseModule],
  controllers: [TwitterConnController],
  providers: [TwitterConnService],
})
export class TwitterConnModule {}
