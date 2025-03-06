import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FirebaseModule } from 'src/lib/plugin/firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]),FirebaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
