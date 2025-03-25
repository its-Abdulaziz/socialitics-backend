import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFacebookConnDto } from './dto/create-facebook-conn.dto';
import { UpdateFacebookConnDto } from './dto/update-facebook-conn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookConn } from './entities/facebook-conn.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
@Injectable()
export class FacebookConnService {
  constructor(
    @InjectRepository(FacebookConn) private readonly facebookConnRepository: Repository<FacebookConn>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    
  ) {}
  async create(body: CreateFacebookConnDto, req: any) {
    const isExist: any = await this.findOne(req.currentUser.firebaseUID)
    console.log(isExist)
    if(isExist.isExist == true) {
      throw new HttpException("You already connected with Facebook, delete the exist one first", HttpStatus.BAD_REQUEST)
    }
    const response = await axios.post(
      'https://graph.facebook.com/v22.0/oauth/access_token',
      new URLSearchParams({
        code: body.auth_code.toString(),
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
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
        `Facebook OAuth failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    const accountInfo = await axios.get('https://graph.facebook.com/v22.0/me/feed', {
      params: {
        access_token: response.data.access_token,
        fields: 'id,name',
      }
    }).catch(error => {
      console.error('Account info failed:', error.response?.data);
      throw new HttpException(
        `Facebook OAuth failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    try {
    const res = await this.facebookConnRepository.save(
      {
        firebaseUID: req.currentUser.firebaseUID,
        accessToken: response.data.access_token,
        validUntil: new Date(Date.now() + response.data.expires_in * 1000),
        name: accountInfo.data.name,
        facebookID: accountInfo.data.id,
        createdAt: new Date()
      }
    );
    await this.userRepository.update(req.currentUser.firebaseUID, {
      FaceBookUserName: accountInfo.data.name})
    return res;
  }
  catch (error) {
    throw new HttpException(
      `Error updating database: ${error.response?.data?.error_description}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }  }

  findAll() {
    return `This action returns all facebookConn`;
  }

  async findOne(firebaseUID: string) {
    let response = {}
    try {
    const exist = await this.facebookConnRepository.findOne({
      where: {
        firebaseUID
      }
    })

    if(exist) {
      response= {
        isExist: true,
        name: exist.name,
        facebookID: exist.facebookID,
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

  update(id: number, updateFacebookConnDto: UpdateFacebookConnDto) {
    return `This action updates a #${id} facebookConn`;
  }

  async remove(firebaseUID: string, req: any) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      const res = await this.facebookConnRepository.delete({ firebaseUID })
      await this.userRepository.update(firebaseUID , 
        { FaceBookUserName: null })
      return res
    }
    catch (error) {
      throw new HttpException(`Error removing data from database: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
