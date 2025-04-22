import { Module } from '@nestjs/common';
import { PostsSchedulerService } from './posts-scheduler.service';
import { PostsSchedulerController } from './posts-scheduler.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsScheduler } from './entities/posts-scheduler.entity';
import { TwitterConnModule } from 'src/connections/twitter-conn/twitter-conn.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TiktokConnModule } from 'src/connections/tiktok-conn/tiktok-conn.module';
import { InstagramConnModule } from 'src/connections/instagram-conn/instagram-conn.module';

@Module({

  imports: [TypeOrmModule.forFeature([PostsScheduler]), 
  TwitterConnModule,
  TiktokConnModule,
  InstagramConnModule,  
  FirebaseModule, 
  ScheduleModule.forRoot()],
  controllers: [PostsSchedulerController],
  providers: [PostsSchedulerService],
})
export class PostsSchedulerModule {}
