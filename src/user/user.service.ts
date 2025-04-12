import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto } from './dto/get-user.dto';
import { TwitterConnService } from 'src/connections/twitter-conn/twitter-conn.service';
import { TiktokConnService } from 'src/connections/tiktok-conn/tiktok-conn.service';
import { InstagramConnService } from 'src/connections/instagram-conn/instagram-conn.service';
import { FacebookConnService } from 'src/connections/facebook-conn/facebook-conn.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private tiktokService: TiktokConnService,
    private twitterService: TwitterConnService,
    private instagramService: InstagramConnService,
    private facebookService: FacebookConnService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(
      { 
        firebaseUID: createUserDto.firebaseUID,
        email: createUserDto.email,
        name: createUserDto.name,
        image: createUserDto.image,
        bio: createUserDto.bio
      }
    );
  }

  findOne(firebaseUID: string) {
    return this.userRepository.findOne({ where: { firebaseUID } });
  }

  findAll() {
    return this.userRepository.find();
  }

  checkExist(firebaseUID: string) {
    console.log(this.userRepository.exists({ where: { firebaseUID } }))
    return this.userRepository.exists({ where: { firebaseUID } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(firebaseUID: string, req: any) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      const res = await this.userRepository.delete({ firebaseUID })
      await this.tiktokService.remove(firebaseUID, req)
      await this.twitterService.remove(firebaseUID, req)
      await this.instagramService.remove(firebaseUID, req)
      await this.facebookService.remove(firebaseUID, req)
      return res
    }
    catch (error) {
      throw new HttpException(`Error removing data from database: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }  
  }
}
