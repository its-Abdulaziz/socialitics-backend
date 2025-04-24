import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDeepseekTipDto } from './dto/create-deepseek-tip.dto';
import { UpdateDeepseekTipDto } from './dto/update-deepseek-tip.dto';
import OpenAI from "openai";
import { performanceTips } from './entities/performance-tips.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TiktokAnalysis } from 'src/scheduler/tiktok-scheduler/entities/tiktok-analysis.entity';
import { platform } from 'os';
import { InstagramAnalysis } from 'src/scheduler/instagram-scheduler/entities/instagram-analysis.entity';
import { TwitterAnalysis } from 'src/scheduler/twitter-scheduler/entities/twitter-analysis.entity';
@Injectable()
export class DeepseekTipsService {
  private readonly openai: OpenAI;

  private systemMessage: string = 'You are a helpful assistant, you will get a data object of a Tiktok account weekly performance, and you will get the bio of the account to understand what is this account for, so based on that information you will provide 4 actionable tips to improve this account reach and engagement, in the analysis object, you will notice that there as an attribute name and same attribute start with diff,  for example: numOfPosts and diffNumOfPosts, attributes starts with diff means the difference between this week and last week, so you can provide tips based on that also to enhance each one, if it\'s week number 1, ignore it, but if it\' not week number 1, provide tips to enhance weak diff attributes, in your response, provide only the tips in a points format and put \" | \" between each tip to separate them';
  private userMessage: any;

  constructor(
    @InjectRepository(performanceTips) private readonly performanceTipsRepository: Repository<performanceTips>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(TiktokAnalysis) private readonly tiktokAnalysisRepository: Repository<TiktokAnalysis>,
    @InjectRepository(InstagramAnalysis) private readonly instagramAnalysisRepository: Repository<InstagramAnalysis>,
    @InjectRepository(TwitterAnalysis) private readonly twitterAnalysisRepository: Repository<TwitterAnalysis>,

  ) {
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async addTiktokTips(firebaseUID: any) {

  try {
    const user = await this.usersRepository.findOne({ where: { firebaseUID } });

    const latest = await this.tiktokAnalysisRepository
    .createQueryBuilder('tiktok_analysis')
    .where('tiktok_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })
    .orderBy('tiktok_analysis.weekNumber', 'DESC') 
    .limit(2)  
    .getMany(); 
   
    console.log(latest[1])
    console.log(latest[0])

    const thisWeek = latest[0];
    const prevWeek = latest[1] ?? null;

    const diffFollowers = prevWeek ? thisWeek.followersCount - prevWeek.followersCount : 0;
    const diffPosts = prevWeek ? thisWeek.postsCount - prevWeek.postsCount : 0;
    const diffLikes = prevWeek ? thisWeek.likesCount - prevWeek.likesCount : 0;
    const diffComments = prevWeek ? thisWeek.commentsCount - prevWeek.commentsCount : 0;
    const diffViews = prevWeek ? thisWeek.viewsCount - prevWeek.viewsCount : 0;
    const diffEngagements = prevWeek ? (thisWeek.engagementRate - prevWeek.engagementRate) : 0;
    const diffShares = prevWeek ? thisWeek.sharesCount - prevWeek.sharesCount : 0;
    
    const formatDiff = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);

    this.userMessage = {
      "bio":user.bio,
      "AccountWeekAnalysis": {
          "weekNumber": latest[0].weekNumber,
          "totalFollowers": latest[0].followersCount,
          "diffTotalFollowers": formatDiff(diffFollowers),
          "numOfPosts": latest[0].postsCount,
          "diffNumOfPosts": formatDiff(diffPosts),
          "totalLikes": latest[0].likesCount,
          "diffTotalLikes": formatDiff(diffLikes),
          "totalShares": latest[0].sharesCount,
          "diffTotalShares": formatDiff(diffShares),
          "totalComments": latest[0].commentsCount,
          "diffTotalComments": formatDiff(diffComments),
          "totalViews": latest[0].viewsCount,
          "diffTotalViews": formatDiff(diffViews),
          "engagementRate": latest[0].engagementRate,
          "diffEngagementRate": formatDiff(diffEngagements)
      }
    }

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "system", content: this.systemMessage }, 
                 { role: "user", content: JSON.stringify(this.userMessage)}],
      model: "deepseek-reasoner",
    }).catch((error) => {
      throw new HttpException(`Error from deepseek api: ${error.response.data}`, 
        HttpStatus.INTERNAL_SERVER_ERROR);
    });
   
    const tipsArray = completion.choices[0].message.content.split(' | ');

    
    const tip = await this.performanceTipsRepository.save({
      firebaseUID: firebaseUID,
      weekNumber: latest[0].weekNumber,
      platform: 'tikTok',
      tips: tipsArray,
    });

    console.log("Tips from week number " + latest[0].weekNumber + " for user " + firebaseUID + " added to database")

    return true;

    } catch (error) {
      throw new HttpException(`Error adding TikTok tips to database: ${error}`, 
        HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

  async getTikTokTips(firebaseUID: string) {

    try {
    const weeksTips = await this.performanceTipsRepository.find({
      where: {
        firebaseUID: firebaseUID,
        platform: 'tikTok'
      },
      order: { weekNumber: 'ASC' }})


        let transformedData = {
          firebaseUID: weeksTips[0].firebaseUID,
          platform: 'tikTok',
          data: []
        }
        
        weeksTips.forEach(week => {
          week.tips.forEach(tip => {
            tip.replaceAll('\'', '').trim()
          })
          transformedData.data.push({
            weekNumber: week.weekNumber,
            tips: week.tips
          })
        })
          
      return transformedData
    } catch (error) {
      throw new HttpException(`Error getting TikTok tips from database: ${error}`, 
        HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async addInstagramTips(firebaseUID: any) {

    try {

      const user = await this.usersRepository.findOne({ where: { firebaseUID } });

      const latest = await this.instagramAnalysisRepository
      .createQueryBuilder('instagram_analysis')
      .where('instagram_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })
      .orderBy('instagram_analysis.weekNumber', 'DESC') 
      .limit(2)  
      .getMany();

  
      const thisWeek = latest[0];
      const prevWeek = latest[1] ?? null;

      console.log(thisWeek)
      console.log(prevWeek)

      const formatDiff = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);


      const diffFollowers = prevWeek ? thisWeek.followersCount - prevWeek.followersCount : 0;
      const diffPosts = prevWeek ? thisWeek.postsCount - prevWeek.postsCount : 0;
      const diffLikes = prevWeek ? thisWeek.likesCount - prevWeek.likesCount : 0;
      const diffComments = prevWeek ? thisWeek.commentsCount - prevWeek.commentsCount : 0;
      const diffViews = prevWeek ? thisWeek.viewsCount - prevWeek.viewsCount : 0;
      const diffReach = prevWeek ? thisWeek.reachCount - prevWeek.reachCount : 0;
      const diffInteractions = prevWeek ? thisWeek.totalInteractions - prevWeek.totalInteractions : 0;
      const diffEngagements = prevWeek ? (thisWeek.engagementRate - prevWeek.engagementRate) : 0;      

      this.userMessage = {
        "bio":user.bio,
        "AccountWeekAnalysis": {
            "weekNumber": thisWeek.weekNumber,
            "totalFollowers": thisWeek.followersCount,
            "diffTotalFollowers": formatDiff(diffFollowers),
            "numOfPosts": thisWeek.postsCount,
            "diffNumOfPosts": formatDiff(diffPosts),
            "totalLikes": thisWeek.likesCount,
            "diffTotalLikes": formatDiff(diffLikes),
            "totalComments": thisWeek.commentsCount,
            "diffTotalComments": formatDiff(diffComments),
            "totalViews": thisWeek.viewsCount,
            "diffTotalViews": formatDiff(diffViews),
            "totalReach": thisWeek.reachCount,
            "diffReach": formatDiff(diffReach),
            "totalInteractions": thisWeek.totalInteractions,
            "diffTotalInteractions": formatDiff(diffInteractions),
            "engagementRate": thisWeek.engagementRate,
            "diffEngagementRate": formatDiff(diffEngagements)
        }
      }

      const newSystemMessage =  this.systemMessage.replaceAll(' Tiktok', 'n Instagram').trim()

      
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: newSystemMessage }, 
                   { role: "user", content: JSON.stringify(this.userMessage)}],
        model: "deepseek-reasoner",
      }).catch((error) => {
        throw new HttpException(`Error from deepseek api: ${error.response.data}`, 
          HttpStatus.INTERNAL_SERVER_ERROR);
      });

      console.log(completion.choices[0].message.content)

      const tipsArray = completion.choices[0].message.content.split(' | ');

    
      const tip = await this.performanceTipsRepository.save({
        firebaseUID: firebaseUID,
        weekNumber: thisWeek.weekNumber,
        platform: 'instagram',
        tips: tipsArray,
      });
  
      console.log("Tips from week number " + thisWeek.weekNumber + " for user " + firebaseUID + " added to database")
  
      return true
    } catch (error) {
      throw new HttpException(`Error adding Instagram tips to database: ${error.Response.data}`, 
        HttpStatus.INTERNAL_SERVER_ERROR)
   }

  }

  async getInstagramTips(firebaseUID: string) {

    try {
    const weeksTips = await this.performanceTipsRepository.find({
      where: {
        firebaseUID: firebaseUID,
        platform: 'instagram'
      },
      order: { weekNumber: 'ASC' }})


        let transformedData = {
          firebaseUID: weeksTips[0].firebaseUID,
          platform: 'instagram',
          data: []
        }
        
        weeksTips.forEach(week => {
          week.tips.forEach(tip => {
            tip.replaceAll('\'', '').trim()
          })
          transformedData.data.push({
            weekNumber: week.weekNumber,
            tips: week.tips
          })
        })
          
      return transformedData
    } catch (error) {
      throw new HttpException(`Error getting Instagram tips from database: ${error.Response.data}`, 
        HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async addTwitterTips(firebaseUID: string) { 
    try {
      const user = await this.usersRepository.findOne({ where: { firebaseUID } });

      const latest = await this.twitterAnalysisRepository
      .createQueryBuilder('twitter_analysis')
      .where('twitter_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })
      .orderBy('twitter_analysis.weekNumber', 'DESC') 
      .limit(2)  
      .getMany();

  
      const thisWeek = latest[0];
      const prevWeek = latest[1] ?? null;

      console.log(thisWeek)
      console.log(prevWeek)

      const diffFollowers = prevWeek ? thisWeek.followersCount - prevWeek.followersCount : 0;
      const diffPosts = prevWeek ? thisWeek.tweetsCount - prevWeek.tweetsCount : 0;
      const diffLikes = prevWeek ? thisWeek.likesCount - prevWeek.likesCount : 0;
      const diffRetweets = prevWeek ? thisWeek.retweetsCount - prevWeek.retweetsCount : 0;
      const diffReplies = prevWeek ? thisWeek.repliesCount - prevWeek.repliesCount : 0;
      const diffEngagements = prevWeek ? (thisWeek.likesCount + thisWeek.retweetsCount + thisWeek.repliesCount) - (prevWeek.likesCount + prevWeek.retweetsCount + prevWeek.repliesCount) : 0;
      const diffImpressions = prevWeek ? thisWeek.impressionsCount - prevWeek.impressionsCount : 0;
      
      const formatDiff = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);
    
      this.userMessage = {
        "bio":user.bio,
        "AccountWeekAnalysis": {
            "weekNumber": thisWeek.weekNumber,
            "totalFollowers": thisWeek.followersCount,
            "diffTotalFollowers": formatDiff(diffFollowers),
            "numOfPosts": thisWeek.tweetsCount,
            "diffNumOfPosts": formatDiff(diffPosts),
            "totalLikes": thisWeek.likesCount,
            "diffTotalLikes": formatDiff(diffLikes),
            "totalRetweets": thisWeek.retweetsCount,
            "diffTotalRetweets": formatDiff(diffRetweets),
            "totalReplies": thisWeek.repliesCount,
            "diffTotalReplies": formatDiff(diffReplies),
            "totalImpressions": thisWeek.impressionsCount,
            "diffTotalImpressions": formatDiff(diffImpressions),
            "engagementRate": thisWeek.engagementRate,
            "diffEngagementRate": formatDiff(diffEngagements)
        }
      }

      const newSystemMessage =  this.systemMessage.replaceAll('Tiktok', 'Twitter \"X\"').trim()

      
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: newSystemMessage }, 
                   { role: "user", content: JSON.stringify(this.userMessage)}],
        model: "deepseek-reasoner",
      }).catch((error) => {
        throw new HttpException(`Error from deepseek api: ${error.response.data}`, 
          HttpStatus.INTERNAL_SERVER_ERROR);
      });

      console.log(completion.choices[0].message.content)

      const tipsArray = completion.choices[0].message.content.split(' | ');

    
      const tip = await this.performanceTipsRepository.save({
        firebaseUID: firebaseUID,
        weekNumber: thisWeek.weekNumber,
        platform: 'twitter',
        tips: tipsArray,
      });
  
      console.log("Tips from week number " + thisWeek.weekNumber + " for user " + firebaseUID + " added to database")
  
      return true

    } catch (error) {
      throw new HttpException(`Error adding Twitter tips to database: ${error.Response.data}`, 
        HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getTwitterTips(firebaseUID: string){


    try {
      const weeksTips = await this.performanceTipsRepository.find({
        where: {
          firebaseUID: firebaseUID,
          platform: 'twitter'
        },
        order: { weekNumber: 'ASC' }})
  
  
          let transformedData = {
            firebaseUID: weeksTips[0].firebaseUID,
            platform: 'twitter',
            data: []
          }
          
          weeksTips.forEach(week => {
            week.tips.forEach(tip => {
              tip.replaceAll('\'', '').trim()
            })
            transformedData.data.push({
              weekNumber: week.weekNumber,
              tips: week.tips
            })
          })
            
        return transformedData
      } catch (error) {
        throw new HttpException(`Error getting Twitter tips from database: ${error.Response.data}`, 
          HttpStatus.INTERNAL_SERVER_ERROR)
      }
      
  }


  create(createDeepseekTipDto: CreateDeepseekTipDto) {
    return 'This action adds a new deepseekTip';
  }

  findAll() {
    return `This action returns all deepseekTips`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deepseekTip`;
  }

  update(id: number, updateDeepseekTipDto: UpdateDeepseekTipDto) {
    return `This action updates a #${id} deepseekTip`;
  }

  remove(id: number) {
    return `This action removes a #${id} deepseekTip`;
  }
}
