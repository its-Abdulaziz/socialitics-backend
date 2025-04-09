import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateTwitterConnDto } from './dto/create-twitter-conn.dto';
import { UpdateTwitterConnDto } from './dto/update-twitter-conn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitterConn } from './entities/twitter-conn.entity';
import axios from 'axios';
import { User } from 'src/user/entities/user.entity';
import { Tweets } from 'src/scheduler/twitter-scheduler/entities/tweets.entity';

@Injectable()
export class TwitterConnService {
  constructor(
    @InjectRepository(TwitterConn) private readonly twitterConnRepository: Repository<TwitterConn>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tweets) private readonly tweetsRepository: Repository<Tweets>,
  ) {}
  //TO DO: refresh acces token, access token valid for 2 hours only
  /*
  const response = await axios.post('https://api.x.com/2/oauth2/token', new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: 'YOUR_REFRESH_TOKEN',
    client_id: 'YOUR_CLIENT_ID',
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
*/
  async create(body: CreateTwitterConnDto, req: any) {
    const isExist: any = await this.findOne(req.currentUser.firebaseUID)
    console.log(isExist)
    if(isExist.isExist == true) {
      throw new HttpException("You already connected with Twitter, delete the exist one first", HttpStatus.BAD_REQUEST)
    }
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

    try {
    const res = await this.twitterConnRepository.save(
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
        createdAt: new Date()
      }
    );
    await this.userRepository.update(req.currentUser.firebaseUID, {
      TwitterUserName: accountInfo.data.data.username})
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
    return `This action returns all twitterConn`;
  }

  async findOne(firebaseUID: string) {
    let response: any = {}
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

  async remove(firebaseUID: string, req: any) {
    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can remove only your own data",HttpStatus.BAD_REQUEST)
    }
    try {
      const res = await this.twitterConnRepository.delete({ firebaseUID })
      await this.userRepository.update(firebaseUID , 
        { TwitterUserName: null })
      await this.tweetsRepository.delete({ firebaseUID })
      return res
    }
    catch (error) {
      throw new HttpException(`Error removing data from database: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(body: any) {

    try{
    const userConn = await this.twitterConnRepository.findOne({
      where: {
        firebaseUID: body.firebaseUID
      }
    })
    if(!userConn) {
      throw new HttpException("User not found",HttpStatus.BAD_REQUEST)
    }

    const response = await axios.post('https://api.x.com/2/oauth2/token', new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: userConn.refreshToken,
      client_id: process.env.TWITTER_CLIENT_ID,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    console.log(response.data.access_token)

    const update = await this.twitterConnRepository.update(body.firebaseUID, {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      validUntil: new Date(Date.now() + response.data.expires_in * 1000)
    })

    console.log("updated successfully", update)
    return true

    } catch (error) {
      console.error(error)
      throw new HttpException(
        `Error refreshing token: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
  }
}
