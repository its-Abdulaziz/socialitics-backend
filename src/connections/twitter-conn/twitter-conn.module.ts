import { forwardRef, Module } from '@nestjs/common';
import { TwitterConnService } from './twitter-conn.service';
import { TwitterConnController } from './twitter-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterConn } from './entities/twitter-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';
import { Tweets } from 'src/scheduler/twitter-scheduler/entities/tweets.entity';
import { TwitterSchedulerModule } from 'src/scheduler/twitter-scheduler/twitter-scheduler.module';
import { TwitterAnalysis } from 'src/scheduler/twitter-scheduler/entities/twitter-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterConn, User, Tweets, TwitterAnalysis]), 
  forwardRef(() => UserModule), 
  FirebaseModule, 
  forwardRef(() => TwitterSchedulerModule)],
  controllers: [TwitterConnController],
  providers: [TwitterConnService],
  exports: [TwitterConnService],
})
export class TwitterConnModule {}
