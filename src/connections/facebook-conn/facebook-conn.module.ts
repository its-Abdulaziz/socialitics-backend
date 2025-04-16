import { forwardRef, Module } from '@nestjs/common';
import { FacebookConnService } from './facebook-conn.service';
import { FacebookConnController } from './facebook-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookConn } from './entities/facebook-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';
import { FacebookSchedulerModule } from 'src/scheduler/facebook-scheduler/facebook-scheduler.module';
import { FacebookAnalysis } from 'src/scheduler/facebook-scheduler/entities/facebook-analysis.entity';
import { FacebookPosts } from 'src/scheduler/facebook-scheduler/entities/facebook-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookConn, User, FacebookAnalysis, FacebookPosts]), 
  forwardRef(() => UserModule), 
  FirebaseModule,   
  forwardRef(() => FacebookSchedulerModule)],
  controllers: [FacebookConnController],
  providers: [FacebookConnService],
  exports: [FacebookConnService],
})
export class FacebookConnModule {}
