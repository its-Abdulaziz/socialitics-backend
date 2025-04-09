import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TwitterConnService } from 'src/connections/twitter-conn/twitter-conn.service';
import { Tweets } from './entities/tweets.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitterAnalysis } from './entities/twitter-analysis.entity';

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
  } catch (error) {
    throw new HttpException(
      `Error fetching database: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  const lastWeek = await this.twitterAnalysisRepository
  .createQueryBuilder('twitter_analysis')
  .select('twitter_analysis.weekNumber')
  .addSelect('twitter_analysis.endDate')
  .where('twitter_analysis.firebaseUID = :firebaseUID', { firebaseUID: body.firebaseUID })  
  .orderBy('twitter_analysis.weekNumber', 'DESC') 
  .limit(1)  
  .getOne(); 

  let lastEndDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let weeksAvailable = 0;
  if (lastWeek) {
    lastEndDate = new Date(lastWeek.endDate);
    weeksAvailable = lastWeek.weekNumber;
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
