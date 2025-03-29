import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTiktokConnDto } from './dto/create-tiktok-conn.dto';
import { UpdateTiktokConnDto } from './dto/update-tiktok-conn.dto';
import { TiktokConn } from './entities/tiktok-conn.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import axios from 'axios';

@Injectable()
export class TiktokConnService {
  constructor(
    @InjectRepository(TiktokConn) private readonly tiktokConnRepository: Repository<TiktokConn>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    
  ) {}
  async create(body: CreateTiktokConnDto, req:any) {
    const isExist: any = await this.findOne(req.currentUser.firebaseUID)
    console.log(isExist)
    if(isExist.isExist == true) {
      throw new HttpException("You already connected with TikTok, delete the exist one first", HttpStatus.BAD_REQUEST)
    }
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        code: body.auth_code.toString(),
        grant_type: 'authorization_code',
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        redirect_uri: body.redirect_uri.toString(),
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    ).catch(error => {
      console.error('Token exchange failed:', error.response?.data);
      throw new HttpException(
        `Tiktok OAuth failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    const accountInfo = await axios.get("https://open.tiktokapis.com/v2/user/info/?fields=open_id,username",{
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      }
    }).catch(error => {
      console.error('Account info failed:', error.response?.data);
      throw new HttpException(
        `Tiktok get data failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    try {
      const res = await this.tiktokConnRepository.save(
        {
          firebaseUID: req.currentUser.firebaseUID,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          validUntil: new Date(Date.now() + response.data.expires_in * 1000),
          refreshValidUntil: new Date(Date.now() + response.data.refresh_expires_in * 1000),
          scope: response.data.scope,
          userName: accountInfo.data.data.user.username,
          tiktokID: accountInfo.data.data.user.open_id,
          createdAt: new Date()
        }
      );
      await this.userRepository.update(req.currentUser.firebaseUID, {
        TiktokUserName: accountInfo.data.data.username})
      return res;
    }
    catch (error) {
      throw new HttpException(
        `Error updating database: ${error.response?.data?.error_description}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  findAll() {
    return `This action returns all tiktokConn`;
  }

  async findOne(firebaseUID: string) {
    let response = {}
    try {
    const exist = await this.tiktokConnRepository.findOne({
      where: {
        firebaseUID
      }
    })

    if(exist) {
      response= {
        isExist: true,
        userName: exist.userName,
        tiktokID: exist.tiktokID,
      }
    }
    else
      response = { isExist: false }

    } catch (error) {
      throw new HttpException(
        `Error fetching database: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return response
  }

  update(id: number, updateTiktokConnDto: UpdateTiktokConnDto) {
    return `This action updates a #${id} tiktokConn`;
  }

  async remove(firebaseUID: string, req: any) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      const res = await this.tiktokConnRepository.delete({ firebaseUID })
      await this.userRepository.update(firebaseUID , 
        { TiktokUserName: null })
      return res
    }
    catch (error) {
      throw new HttpException(`Error removing data from database: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
