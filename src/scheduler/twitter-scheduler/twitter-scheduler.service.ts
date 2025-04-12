import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  @Cron('25 18 * * *')
  async getTwitterTweets(body: any) {
    const firebaseUID = 'm2QrpPJ63yN2oreSHceT6RgCDX23';
    try {
      const conn = await this.twitterConnService.findOne(firebaseUID);

      if(conn.isExist != true) {
        throw new Error('Twitter connection not exist for this user');
     }

     const access_token = await this.twitterConnService.refreshToken({firebaseUID: firebaseUID});
     //const access_token = conn.access_token;
     const lastWeek = await this.twitterAnalysisRepository
     .createQueryBuilder('twitter_analysis')
     .select('twitter_analysis.weekNumber')
     .where('twitter_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })  
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
      console.log(tweets.data.data,'\n\n\n')

      let totalTweets = 0, totalLikes = 0, totalRetweets = 0, totalReplies = 0, totalImpressions = 0, totalEngagement = 0, followersCount = 0;     
      
      for(let tweet of tweets.data.data) {
      totalTweets++
      totalLikes += tweet.public_metrics.like_count
      totalRetweets += tweet.public_metrics.retweet_count
      totalReplies += tweet.public_metrics.reply_count
      totalImpressions += tweet.public_metrics.impression_count
      let saveTweet = await this.tweetsRepository.save({
        tweetId: tweet.id,
        firebaseUID: firebaseUID,
        twitterUID: conn.twitterID,
        content: tweet.text,
        createdAt: tweet.created_at,
        retweets: tweet.public_metrics.retweet_count,
        likes: tweet.public_metrics.like_count,
        replies: tweet.public_metrics.reply_count,
        impressions: tweet.public_metrics.impression_count,
        engagement: tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + tweet.public_metrics.reply_count + tweet.public_metrics.quote_count
      })
     }

     console.log(totalTweets, totalLikes, totalRetweets, totalReplies, totalImpressions, totalEngagement)
     const accountInfo = await axios.get("https://api.twitter.com/2/users/me?user.fields=public_metrics",{
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    }).catch((error) => {
      console.log(error)
      throw new HttpException(
        `Error getting followers count ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })
     followersCount = accountInfo.data.data.public_metrics.followers_count

     const analysisData = await this.generateWeekAnalysis(lastEndDate, newEndDate, totalTweets, totalLikes, totalRetweets, totalReplies, totalImpressions, weeksAvailable, followersCount, firebaseUID, conn.twitterID, conn.userName)
     if(analysisData) {
      console.log("Analysis data saved successfully for user ", conn.userName, " for week ", weeksAvailable + 1)
     }
     return true
   } catch (error) {
  throw new HttpException(
    `Error ${error}`,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}
  
  }

  async generateWeekAnalysis(startDate: Date, endDate: Date, 
    totalTweets: number, totalLikes: number, 
    totalRetweets: number, totalReplies: number, 
    totalImpressions: number, weeksAvailable: number, 
    followersCount: number, firebaseUID: string, 
    twitterID: string, userName: string) {
      try {
    const saveWeekAnalysis = await this.twitterAnalysisRepository.save({
      firebaseUID: firebaseUID,
      weekNumber: weeksAvailable + 1,
      twitterId: twitterID,
      userName: userName,
      startDate: startDate,
      endDate: endDate,
      tweetsCount: totalTweets,
      followersCount: followersCount,
      likesCount: totalLikes,
      retweetsCount: totalRetweets,
      repliesCount: totalReplies,
      impressionsCount: totalImpressions,
      engagementRate: ((totalLikes + totalRetweets + totalReplies) / (followersCount)) * 100
    })

    return true
  } catch (error) {
    throw new HttpException(
      `Error saving twitter week analysis ${error}`,
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
