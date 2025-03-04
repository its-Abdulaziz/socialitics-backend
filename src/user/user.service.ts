import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(
      { 
        firebaseUID: createUserDto.firebaseUID,
        email: createUserDto.email,
        name: createUserDto.name,
      }
    );
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(firebaseUID: string) {
    console.log(this.userRepository.exists({ where: { firebaseUID } }))
    return this.userRepository.exists({ where: { firebaseUID } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
