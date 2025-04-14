import { forwardRef, Module } from '@nestjs/common';
import { TiktokConnService } from './tiktok-conn.service';
import { TiktokConnController } from './tiktok-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokConn } from './entities/tiktok-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';
import { TiktokSchedulerModule } from 'src/scheduler/tiktok-scheduler/tiktok-scheduler.module';
import { TiktokAnalysis } from 'src/scheduler/tiktok-scheduler/entities/tiktok-analysis.entity';
import { TiktokPosts } from 'src/scheduler/tiktok-scheduler/entities/tiktok-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TiktokConn, User, TiktokAnalysis, TiktokPosts]), 
  forwardRef(() => UserModule), 
  FirebaseModule, 
  forwardRef(() => TiktokSchedulerModule)],
  controllers: [TiktokConnController],
  providers: [TiktokConnService],
  exports: [TiktokConnService],
})
export class TiktokConnModule {}
