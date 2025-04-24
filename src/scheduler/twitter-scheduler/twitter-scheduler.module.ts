import { forwardRef, Module } from '@nestjs/common';
import { TwitterSchedulerService } from './twitter-scheduler.service';
import { TwitterSchedulerController } from './twitter-scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterConn } from 'src/connections/twitter-conn/entities/twitter-conn.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { Tweets } from './entities/tweets.entity';
import { TwitterConnModule } from 'src/connections/twitter-conn/twitter-conn.module';
import { TwitterAnalysis } from './entities/twitter-analysis.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { DeepseekTipsModule } from 'src/deepseek/deepseek-tips/deepseek-tips.module';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterConn, Tweets, TwitterAnalysis ]), 
  forwardRef(() => TwitterConnModule), 
  FirebaseModule,
  DeepseekTipsModule,
ScheduleModule.forRoot()],
  controllers: [TwitterSchedulerController],
  providers: [TwitterSchedulerService],
  exports: [TwitterSchedulerService],
})
export class TwitterSchedulerModule {}
