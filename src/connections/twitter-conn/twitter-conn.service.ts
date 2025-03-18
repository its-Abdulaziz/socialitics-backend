import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateTwitterConnDto } from './dto/create-twitter-conn.dto';
import { UpdateTwitterConnDto } from './dto/update-twitter-conn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitterConn } from './entities/twitter-conn.entity';
import axios from 'axios';

@Injectable()
export class TwitterConnService {
  constructor(
    @InjectRepository(TwitterConn) private readonly twitterConnRepository: Repository<TwitterConn>,
    
  ) {}
  
  async create(body: CreateTwitterConnDto, req: any) {
    console.log(body);
    const response = await axios.post(
      'https://api.x.com/2/oauth2/token',
      new URLSearchParams({
        code: body.auth_code.toString(),
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID,
        client_secret: process.env.TWITTER_CLIENT_SECRET,
        redirect_uri: body.redirect_uri.toString(),
        code_verifier: 'challenge'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    ).catch(error => {
      console.error('Token exchange failed:', error.response?.data);
      throw new HttpException(
        `Twitter OAuth failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    const accountInfo = await axios.get("https://api.twitter.com/2/users/me?user.fields=profile_image_url",{
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      }
    }).catch(error => {
      console.error('Account info failed:', error.response?.data);
      throw new HttpException(
        `Twitter OAuth failed: ${error.response?.data?.error_description || 'Unknown error'}`,
        HttpStatus.BAD_REQUEST
      );
    });

    return this.twitterConnRepository.save(
      {
        firebaseUID: req.currentUser.firebaseUID,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        validUntil: new Date(Date.now() + response.data.expires_in * 1000),
        scope: response.data.scope,
        userName: accountInfo.data.data.username,
        name: accountInfo.data.data.name,
        image: accountInfo.data.data.profile_image_url,
        twitterID: accountInfo.data.data.id,
      }
    );
  }

  findAll() {
    return `This action returns all twitterConn`;
  }

  async findOne(firebaseUID: string) {
    let response = {}
    try {
    const exist = await this.twitterConnRepository.findOne({
      where: {
        firebaseUID
      }
    })

    if(exist) {
      response= {
        isExist: true,
        userName: exist.userName,
        name: exist.name,
        image: exist.image,
        twitterID: exist.twitterID,
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

  update(id: number, updateTwitterConnDto: UpdateTwitterConnDto) {
    return `This action updates a #${id} twitterConn`;
  }

  remove(firebaseUID: string, req) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      return this.twitterConnRepository.delete({ firebaseUID })
    }
    catch (error) {
      throw new HttpException(`Error removing data: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
