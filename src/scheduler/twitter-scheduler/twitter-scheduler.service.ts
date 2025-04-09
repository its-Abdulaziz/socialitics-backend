import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterConnService } from 'src/connections/twitter-conn/twitter-conn.service';
import { Tweets } from './entities/tweets.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TwitterSchedulerService {

  constructor(
    private readonly twitterConnService: TwitterConnService,
    @InjectRepository(Tweets) private readonly tweetsRepository: Repository<Tweets>,
  ) {}

  async getTwitterTweets(body: any) {

    const conn = await this.twitterConnService.findOne(body.firebaseUID);

    if(conn.isExist != true) {
      throw new Error('Twitter connection not exist for this user');
    }

    

    
  }

  findAll() {
    return `This action returns all twitterScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} twitterScheduler`;
  }

  update(id: number, updateTwitterSchedulerDto: any) {
    return `This action updates a #${id} twitterScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} twitterScheduler`;
  }
}
