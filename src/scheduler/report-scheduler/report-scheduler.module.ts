import { Module } from '@nestjs/common';
import { ReportSchedulerService } from './report-scheduler.service';
import { ReportSchedulerController } from './report-scheduler.controller';
import { MailModule } from 'src/lib/plugin/mailer/mail.module';
import { FacebookAnalysis } from '../facebook-scheduler/entities/facebook-analysis.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterAnalysis } from '../twitter-scheduler/entities/twitter-analysis.entity';
import { TiktokAnalysis } from '../tiktok-scheduler/entities/tiktok-analysis.entity';
import { InstagramAnalysis } from '../instagram-scheduler/entities/instagram-analysis.entity';
import { User } from 'src/user/entities/user.entity';
import { Reports } from './entities/reports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ User, FacebookAnalysis, TwitterAnalysis, TiktokAnalysis, InstagramAnalysis, Reports ]), 
  FirebaseModule,
  ScheduleModule.forRoot(),
  MailModule],
  controllers: [ReportSchedulerController],
  providers: [ReportSchedulerService],
})
export class ReportSchedulerModule {}
