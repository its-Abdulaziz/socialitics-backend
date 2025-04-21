import { forwardRef, Module } from '@nestjs/common';
import { InstagramConnService } from './instagram-conn.service';
import { InstagramConnController } from './instagram-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramConn } from './entities/instagram-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';
import { InstagramSchedulerModule } from 'src/scheduler/instagram-scheduler/instagram-scheduler.module';
import { InstagramPosts } from 'src/scheduler/instagram-scheduler/entities/instagram-posts.entity';
import { InstagramAnalysis } from 'src/scheduler/instagram-scheduler/entities/instagram-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstagramConn, User, InstagramPosts, InstagramAnalysis]), 
  forwardRef(() => UserModule), 
  FirebaseModule,
  forwardRef(() => InstagramSchedulerModule)],
  controllers: [InstagramConnController],
  providers: [InstagramConnService],
  exports: [InstagramConnService],
})
export class InstagramConnModule {}
