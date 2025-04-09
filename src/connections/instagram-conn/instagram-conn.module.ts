import { forwardRef, Module } from '@nestjs/common';
import { InstagramConnService } from './instagram-conn.service';
import { InstagramConnController } from './instagram-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramConn } from './entities/instagram-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstagramConn, User]), 
  forwardRef(() => UserModule), 
  FirebaseModule],
  controllers: [InstagramConnController],
  providers: [InstagramConnService],
  exports: [InstagramConnService],
})
export class InstagramConnModule {}
