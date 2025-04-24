import { Module } from '@nestjs/common';
import { DeepseekTipsService } from './deepseek-tips.service';
import { DeepseekTipsController } from './deepseek-tips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { performanceTips } from './entities/performance-tips.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from 'src/user/entities/user.entity';
import { TiktokAnalysis } from 'src/scheduler/tiktok-scheduler/entities/tiktok-analysis.entity';
import { InstagramAnalysis } from 'src/scheduler/instagram-scheduler/entities/instagram-analysis.entity';
@Module({
  imports: [TypeOrmModule.forFeature([performanceTips, User, TiktokAnalysis, InstagramAnalysis ]), 
  FirebaseModule,
ScheduleModule.forRoot()],
  controllers: [DeepseekTipsController],
  providers: [DeepseekTipsService],
  exports: [DeepseekTipsService],
})
export class DeepseekTipsModule {}
