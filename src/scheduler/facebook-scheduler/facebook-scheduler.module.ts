import { forwardRef, Module } from '@nestjs/common';
import { FacebookSchedulerService } from './facebook-scheduler.service';
import { FacebookSchedulerController } from './facebook-scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookConn } from 'src/connections/facebook-conn/entities/facebook-conn.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FacebookAnalysis } from './entities/facebook-analysis.entity';
import { FacebookConnModule } from 'src/connections/facebook-conn/facebook-conn.module';
import { FacebookPosts } from './entities/facebook-posts.entity';
import { DeepseekTipsModule } from 'src/deepseek/deepseek-tips/deepseek-tips.module';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookConn, FacebookPosts, FacebookAnalysis ]), 
  forwardRef(() => FacebookConnModule), 
  FirebaseModule,
  DeepseekTipsModule,
ScheduleModule.forRoot()],
  controllers: [FacebookSchedulerController],
  providers: [FacebookSchedulerService],
  exports: [FacebookSchedulerService],
})
export class FacebookSchedulerModule {}
