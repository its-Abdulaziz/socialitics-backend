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
import { Admin } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,

    private dataSource: DataSource,
    private tiktokService: TiktokConnService,
    private twitterService: TwitterConnService,
    private instagramService: InstagramConnService,
    private facebookService: FacebookConnService,
    private readonly jwtService: JwtService,

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
    try {
    return this.userRepository.find({
      select: ['firebaseUID', 'name', 'email']
    });
    } catch (error) {
      throw new HttpException(`Error finding data from database:`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async checkExist(firebaseUID: string) {
    const user = await this.userRepository.findOne({ where: { firebaseUID } });
    if (!user) {
      return {isExist: false}
    }
    return {isExist: true, status: user.status}
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

  async adminLogin(body: any) {

    const admin = await this.adminRepository.findOne({ where: { username: body.username } })

    if(!admin || admin.password != body.password) {
      throw new HttpException("Wrong username or password",HttpStatus.BAD_REQUEST)
    }

    const payload = { username: admin.username, role: admin.role };

    const token = this.jwtService.sign(payload);

    return { adminToken: token, isExist: true };

  }

  async suspendUser(firebaseUID: any) {
    try {
    await this.userRepository.update({ firebaseUID }, { status: 'suspended' });
    return true
    }
    catch (error) {
      throw new HttpException(`Error suspending user`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
