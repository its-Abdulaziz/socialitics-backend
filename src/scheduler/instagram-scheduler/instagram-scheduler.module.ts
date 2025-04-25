import { forwardRef, Module } from '@nestjs/common';
import { InstagramSchedulerService } from './instagram-scheduler.service';
import { InstagramSchedulerController } from './instagram-scheduler.controller';
import { InstagramConn } from 'src/connections/instagram-conn/entities/instagram-conn.entity';
import { InstagramPosts } from './entities/instagram-posts.entity';
import { InstagramAnalysis } from './entities/instagram-analysis.entity';
import { InstagramConnModule } from 'src/connections/instagram-conn/instagram-conn.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DeepseekTipsModule } from 'src/deepseek/deepseek-tips/deepseek-tips.module';


@Module({
  imports: [TypeOrmModule.forFeature([InstagramConn, InstagramPosts, InstagramAnalysis ]), 
  forwardRef(() => InstagramConnModule), 
  FirebaseModule,
  DeepseekTipsModule,
ScheduleModule.forRoot()],
  controllers: [InstagramSchedulerController],
  providers: [InstagramSchedulerService],
  exports: [InstagramSchedulerService],
})
export class InstagramSchedulerModule {}
