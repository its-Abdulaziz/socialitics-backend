import { Injectable } from '@nestjs/common';
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
    const response = await axios.post('https://x.com/i/oauth2/token', new URLSearchParams({
      code: body.auth_code, 
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID,
      client_secret: process.env.TWITTER_CLIENT_SECRET,
      redirect_uri: body.redirect_uri,
      code_verifier: 'challenge', 
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accountInfo = await axios.get("https://api.twitter.com/2/users/me?user.fields=profile_image_url",{
      headers: {
        Authorization: `${response.data.access_token}`,
      }
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

  findOne(firebaseUID: string) {
    return `This action returns a #${firebaseUID} twitterConn`;
  }

  update(id: number, updateTwitterConnDto: UpdateTwitterConnDto) {
    return `This action updates a #${id} twitterConn`;
  }

  remove(id: number) {
    return `This action removes a #${id} twitterConn`;
  }
}
