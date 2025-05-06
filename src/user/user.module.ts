import { forwardRef, Module } from '@nestjs/common';
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
import { Admin } from './entities/admin.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, TwitterConn, TiktokConn, FacebookConn, InstagramConn]),FirebaseModule, 
  forwardRef(() => InstagramConnModule), 
  forwardRef(() => FacebookConnModule), 
  forwardRef(() => TwitterConnModule), 
  forwardRef(() => TiktokConnModule),
  JwtModule.register({
    secret: 'SocialiticsAdmin', 
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
