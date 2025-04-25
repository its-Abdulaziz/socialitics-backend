import { forwardRef, Module } from '@nestjs/common';
import { TiktokSchedulerService } from './tiktok-scheduler.service';
import { TiktokSchedulerController } from './tiktok-scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokConn } from 'src/connections/tiktok-conn/entities/tiktok-conn.entity';
import { TiktokConnModule } from 'src/connections/tiktok-conn/tiktok-conn.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TiktokPosts } from './entities/tiktok-posts.entity';
import { TiktokAnalysis } from './entities/tiktok-analysis.entity';
import { DeepseekTipsModule } from 'src/deepseek/deepseek-tips/deepseek-tips.module';

@Module({
  imports: [TypeOrmModule.forFeature([TiktokConn, TiktokPosts, TiktokAnalysis ]), 
  forwardRef(() => TiktokConnModule), 
  DeepseekTipsModule,
  FirebaseModule,
ScheduleModule.forRoot()],
  controllers: [TiktokSchedulerController],
  providers: [TiktokSchedulerService],
  exports: [TiktokSchedulerService],
})
export class TiktokSchedulerModule {}
