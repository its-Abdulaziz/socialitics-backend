import { forwardRef, Module } from '@nestjs/common';
import { TiktokConnService } from './tiktok-conn.service';
import { TiktokConnController } from './tiktok-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokConn } from './entities/tiktok-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TiktokConn, User]), 
  forwardRef(() => UserModule), 
  FirebaseModule],
  controllers: [TiktokConnController],
  providers: [TiktokConnService],
  exports: [TiktokConnService],

})
export class TiktokConnModule {}
