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
    TwitterSchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
