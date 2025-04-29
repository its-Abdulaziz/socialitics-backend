import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppDataSource } from './data-source';
import { TwitterConnModule } from './connections/twitter-conn/twitter-conn.module';
import { InstagramConnModule } from './connections/instagram-conn/instagram-conn.module';
import { FacebookConnModule } from './connections/facebook-conn/facebook-conn.module';
import { TiktokConnModule } from './connections/tiktok-conn/tiktok-conn.module';
import { TwitterSchedulerModule } from './scheduler/twitter-scheduler/twitter-scheduler.module';
import { TiktokSchedulerModule } from './scheduler/tiktok-scheduler/tiktok-scheduler.module';
import { FacebookSchedulerModule } from './scheduler/facebook-scheduler/facebook-scheduler.module';
import { PostsSchedulerModule } from './posting/posts-scheduler/posts-scheduler.module';
import { InstagramSchedulerModule } from './scheduler/instagram-scheduler/instagram-scheduler.module';
import { DeepseekTipsModule } from './deepseek/deepseek-tips/deepseek-tips.module';
import { ReportSchedulerModule } from './scheduler/report-scheduler/report-scheduler.module';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...AppDataSource.options, 
      }),
    }),
    UserModule, 
    TwitterConnModule,
    InstagramConnModule,
    FacebookConnModule,
    TiktokConnModule,
    TwitterSchedulerModule,
    TiktokSchedulerModule,
    FacebookSchedulerModule,
    InstagramSchedulerModule,
    PostsSchedulerModule,
    DeepseekTipsModule,
    ReportSchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
