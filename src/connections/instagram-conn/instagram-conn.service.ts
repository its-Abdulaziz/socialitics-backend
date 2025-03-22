import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInstagramConnDto } from './dto/create-instagram-conn.dto';
import { UpdateInstagramConnDto } from './dto/update-instagram-conn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InstagramConn } from './entities/instagram-conn.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class InstagramConnService {
  constructor(
    @InjectRepository(InstagramConn) private readonly instagramConnRepository: Repository<InstagramConn>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    
  ) {}
  // TO DO: check validity of access_token when making requests to instagram
  async create(body: CreateInstagramConnDto, req: any) {
    const isExist: any = await this.findOne(req.currentUser.firebaseUID)
    console.log(isExist)
    if(isExist.isExist == true) {
      throw new HttpException("You already connected with Instagram, delete the exist one first", HttpStatus.BAD_REQUEST)
    }

    const response = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      new URLSearchParams({
        code: body.auth_code.toString(),
        grant_type: 'authorization_code',
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
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
        `Instagram OAuth failed in exchange token: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    console.log(response.data)
    const refreshRequest = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${response.data.access_token}`)
    .catch(error => {
    console.error('Refresh token failed:', error);
    throw new HttpException(
      `Instagram OAuth failed in refresh token: ${error.response?.data?.error_description || 'Unknown error'}`,
      HttpStatus.BAD_REQUEST
    );
     });
     console.log(refreshRequest.data)
     const accountInfo = await axios.get(`https://graph.instagram.com/me?fields=username,id&access_token=${refreshRequest.data.access_token}`)
     .catch(error => {
     console.error('Get account info failed:', error);
     throw new HttpException(
       `Instagram OAuth failed in get account info: ${error.response?.data?.error_description || 'Unknown error'}`,
       HttpStatus.BAD_REQUEST
     );
      });
    console.log(accountInfo.data)
    
     try {
      const res = await this.instagramConnRepository.save(
        {
          firebaseUID: req.currentUser.firebaseUID,
          accessToken: refreshRequest.data.access_token,
          validUntil: new Date(Date.now() + refreshRequest.data.expires_in * 1000),
          userName: accountInfo.data.username,
          instagramID: accountInfo.data.id,
          permissions: response.data.permissions,
          createdAt: new Date()
        }
      );
      await this.userRepository.update(req.currentUser.firebaseUID, {
        InstagramUserName: accountInfo.data.username})
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
    return `This action returns all instagramConn`;
  }

  async findOne(firebaseUID: string) {
    let response = {}
    try {
    const exist = await this.instagramConnRepository.findOne({
      where: {
        firebaseUID
      }
    })

    if(exist) {
      response= {
        isExist: true,
        userName: exist.userName,
        instagramID: exist.instagramID,
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

  update(id: number, updateInstagramConnDto: UpdateInstagramConnDto) {
    return `This action updates a #${id} instagramConn`;
  }

  async remove(firebaseUID: string, req: any) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      const res = await this.instagramConnRepository.delete({ firebaseUID })
      await this.userRepository.update(firebaseUID , 
        { InstagramUserName: null })
      return res
    }
    catch (error) {
      throw new HttpException(`Error removing data from database: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
