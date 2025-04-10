import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterConnService } from 'src/connections/twitter-conn/twitter-conn.service';
import { Tweets } from './entities/tweets.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitterAnalysis } from './entities/twitter-analysis.entity';
import axios from 'axios';
import { query } from 'express';

@Injectable()
export class TwitterSchedulerService {

  constructor(
    @Inject(forwardRef(() => TwitterConnService))
    private readonly twitterConnService: TwitterConnService,
    @InjectRepository(Tweets) private readonly tweetsRepository: Repository<Tweets>,
    @InjectRepository(TwitterAnalysis) private readonly twitterAnalysisRepository: Repository<TwitterAnalysis>,

  ) {}

  async getTwitterTweets(body: any) {
    try {
      const conn = await this.twitterConnService.findOne(body.firebaseUID);

      if(conn.isExist != true) {
        throw new Error('Twitter connection not exist for this user');
     }

     const access_token = await this.twitterConnService.refreshToken({firebaseUID: body.firebaseUID});
     //const access_token = conn.access_token;
     const lastWeek = await this.twitterAnalysisRepository
     .createQueryBuilder('twitter_analysis')
     .select('twitter_analysis.weekNumber')
     .where('twitter_analysis.firebaseUID = :firebaseUID', { firebaseUID: body.firebaseUID })  
     .orderBy('twitter_analysis.weekNumber', 'DESC') 
     .limit(1)  
     .getOne(); 
     let lastEndDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
     lastEndDate.setMinutes(lastEndDate.getMinutes() + 2);
     let weeksAvailable = 0;
     if (lastWeek) {
       weeksAvailable = lastWeek.weekNumber;
     }
     const newEndDate = new Date(Date.now());
     newEndDate.setMinutes(newEndDate.getMinutes()  - 2);

     const startTime = lastEndDate.toISOString();
     const endTime = newEndDate.toISOString();

     console.log(startTime, endTime)

     const tweets = await axios.get(`https://api.twitter.com/2/tweets/search/recent`,
      {
      params: {
        query: 'from:socialitics0',
        start_time: startTime,
        end_time: endTime,
        "tweet.fields": 'created_at,public_metrics',
      },
      headers: {
         Authorization: `Bearer ${access_token}`,
      }
     }).catch((error) => {
      console.log(error)
      throw new HttpException(
        `Error fetching tweets ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })


   } catch (error) {
  throw new HttpException(
    `Error ${error}`,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}
  
  }

  findAll() {
    return `This action returns all twitterScheduler`;
  }

  getWeeksNumber(){

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
