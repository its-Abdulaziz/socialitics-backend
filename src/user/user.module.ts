import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { TwitterConn } from 'src/connections/twitter-conn/entities/twitter-conn.entity';
import { TiktokConn } from 'src/connections/tiktok-conn/entities/tiktok-conn.entity';
import { FacebookConn } from 'src/connections/facebook-conn/entities/facebook-conn.entity';
import { InstagramConn } from 'src/connections/instagram-conn/entities/instagram-conn.entity';
import { InstagramConnModule } from 'src/connections/instagram-conn/instagram-conn.module';
import { FacebookConnModule } from 'src/connections/facebook-conn/facebook-conn.module';
import { TwitterConnModule } from 'src/connections/twitter-conn/twitter-conn.module';
import { TiktokConnModule } from 'src/connections/tiktok-conn/tiktok-conn.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, TwitterConn, TiktokConn, FacebookConn, InstagramConn]),FirebaseModule, InstagramConnModule, FacebookConnModule, TwitterConnModule, TiktokConnModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
