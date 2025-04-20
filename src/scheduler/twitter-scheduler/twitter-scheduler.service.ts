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

  //@Cron('25 18 * * *')
  async getTwitterTweets(body: any) {
    const firebaseUID = 'VpJOUX05QSh86FNf44Gb4jGYEF02';
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

      let totalTweets = 0, totalLikes = 0, totalRetweets = 0, totalReplies = 0, totalImpressions = 0, totalEngagement = 0, followersCount = 0, maxImpressions = 0;     
      let topTweetID = "";
      for(let tweet of tweets.data.data) {
      totalTweets++
      totalLikes += tweet.public_metrics.like_count
      totalRetweets += tweet.public_metrics.retweet_count
      totalReplies += tweet.public_metrics.reply_count
      totalImpressions += tweet.public_metrics.impression_count
      if(tweet.public_metrics.impression_count > maxImpressions) {
        maxImpressions = tweet.public_metrics.impression_count
        topTweetID = tweet.id
      }
      let saveTweet = await this.tweetsRepository.save({
        tweetId: tweet.id,
        firebaseUID: firebaseUID,
        twitterUID: conn.twitterID,
        userName: conn.userName,
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

     const analysisData = await this.generateWeekAnalysis(lastEndDate, newEndDate, totalTweets, totalLikes, totalRetweets, totalReplies, totalImpressions, weeksAvailable, followersCount, firebaseUID, conn.twitterID, conn.userName, topTweetID)
     if(analysisData) {
      console.log("Twitter Analysis data saved successfully for user ", conn.userName, " for week ", weeksAvailable + 1)
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
    twitterID: string, userName: string, topTweetID: string) {
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
      engagementRate: ((totalLikes + totalRetweets + totalReplies) / (followersCount)) * 100,
      topTweetID: topTweetID
    })

    return true
  } catch (error) {
    throw new HttpException(
      `Error saving twitter week analysis ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
  }

 async getTwitterAnalysis(body: any, req: any){

  if(body.firebaseUID != req.currentUser.firebaseUID) {
    throw new HttpException("You can get only your own data",HttpStatus.BAD_REQUEST)
  }

    const analysis = await this.twitterAnalysisRepository.find({
      where: {
        firebaseUID: body.firebaseUID
      },
      order: { weekNumber: 'ASC' },
    }).catch((error) => {
      console.log(error)
      throw new HttpException(
        `Error getting twitter analysis from database${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })
    if (!analysis || analysis.length === 0) {
      throw new Error('No twitter analysis found for this user');
    }

    let transformedData = {
      firebaseUID: analysis[0].firebaseUID,
      twitterId: analysis[0].twitterId,
      userName: analysis[0].userName,
      data: []
    };

    analysis.forEach((week, index, weeksArray) => {
      const prevWeek = weeksArray[index - 1];

      const diffFollowers = prevWeek ? week.followersCount - prevWeek.followersCount : 0;
      const diffPosts = prevWeek ? week.tweetsCount - prevWeek.tweetsCount : 0;
      const diffLikes = prevWeek ? week.likesCount - prevWeek.likesCount : 0;
      const diffRetweets = prevWeek ? week.retweetsCount - prevWeek.retweetsCount : 0;
      const diffReplies = prevWeek ? week.repliesCount - prevWeek.repliesCount : 0;
      const diffEngagements = prevWeek ? (week.likesCount + week.retweetsCount + week.repliesCount) - (prevWeek.likesCount + prevWeek.retweetsCount + prevWeek.repliesCount) : 0;
      const diffImpressions = prevWeek ? week.impressionsCount - prevWeek.impressionsCount : 0;
      
      const formatDiff = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);
    
      transformedData.data.push({
        weekNumber: week.weekNumber,
        startDate: this.formatDate(week.startDate),
        endDate: this.formatDate(week.endDate),
        totalFollowers: week.followersCount,
        diffTotalFollowers: formatDiff(diffFollowers),
        numOfPosts: week.tweetsCount,
        diffNumOfPosts: formatDiff(diffPosts),
        totalLikes: week.likesCount,
        diffTotalLikes: formatDiff(diffLikes),
        totalRetweets: week.retweetsCount,
        diffTotalRetweets: formatDiff(diffRetweets),
        totalReplies: week.repliesCount,
        diffTotalReplies: formatDiff(diffReplies),
        totalEngagements: week.likesCount + week.retweetsCount + week.repliesCount,
        diffTotalEngagements: formatDiff(diffEngagements),
        totalImpressions: week.impressionsCount,
        diffTotalImpressions: formatDiff(diffImpressions),
      });
    });
    return transformedData;
  }


  async getTopTweets(body: any, req: any) {

    if(body.firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can get only your own data",HttpStatus.BAD_REQUEST)
    }
    try{
    const analysis = await this.twitterAnalysisRepository.find({
      where: {
        firebaseUID: body.firebaseUID
      },
      order: { weekNumber: 'ASC' },
    })
    let tweets = []
    for (const week of analysis) {        
      const topTweet = await this.tweetsRepository.find({
          where: {
            tweetId: week.topTweetID
          }
        });
        tweets.push({
          weekNumber: week.weekNumber,
          tweetId: topTweet[0].tweetId,
          userName: topTweet[0].userName,
          content: topTweet[0].content,
          likes: topTweet[0].likes,
          replies: topTweet[0].replies,
          retweets: topTweet[0].retweets,
          impressions: topTweet[0].impressions,
          engagementRate: ((topTweet[0].likes + topTweet[0].retweets + topTweet[0].replies) / (week.followersCount)) * 100
        })
    }
    return tweets
  } catch (error) {
    throw new HttpException(
      `Error getting top tweets from database${error}`,
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

  private formatDate(date: Date): string {
    return `${date.getUTCDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getUTCFullYear()}`;
  }
}
