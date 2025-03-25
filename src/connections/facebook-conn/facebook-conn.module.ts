import { Module } from '@nestjs/common';
import { FacebookConnService } from './facebook-conn.service';
import { FacebookConnController } from './facebook-conn.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookConn } from './entities/facebook-conn.entity';
import { UserModule } from 'src/user/user.module';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookConn, User]), UserModule, FirebaseModule],
  controllers: [FacebookConnController],
  providers: [FacebookConnService],
})
export class FacebookConnModule {}
