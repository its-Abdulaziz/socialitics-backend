import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InstagramConnService } from 'src/connections/instagram-conn/instagram-conn.service';
import { InstagramPosts } from './entities/instagram-posts.entity';
import { InstagramAnalysis } from './entities/instagram-analysis.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class InstagramSchedulerService {
  constructor(    
    @Inject(forwardRef(() => InstagramConnService))
    private readonly instagramConnService: InstagramConnService,
    @InjectRepository(InstagramPosts) private readonly instagramPostsRepository: Repository<InstagramPosts>,
    @InjectRepository(InstagramAnalysis) private readonly instagramAnalysisRepository: Repository<InstagramAnalysis>,
  ) {}
  async create(body: any) {
    try {

      const conn: any = await this.instagramConnService.findOne(body.firebaseUID);
      if (!conn.isExist) {
        throw new Error('Instagram connection not exist for this user');
      }

      const accessToken = conn.accessToken;

      const lastWeek = await this.instagramAnalysisRepository
        .createQueryBuilder('instagram_analysis')
        .select('instagram_analysis.weekNumber')
        .where('instagram_analysis.firebaseUID = :firebaseUID', { firebaseUID: body.firebaseUID })
        .orderBy('instagram_analysis.weekNumber', 'DESC')
        .limit(1)
        .getOne();

      let startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // One week back
      let weeksAvailable = lastWeek ? lastWeek.weekNumber : 0;

      console.log('weeksAvailable ', weeksAvailable);
      const endDate = new Date(Date.now());

      const response: any = await axios
      .get(`https://graph.instagram.com/me/media?fields=id,media_type,caption,shortcode,timestamp&access_token=${accessToken}`)
      .catch((error) => {
        console.log(error.response.data);
        throw new HttpException(
          `Error fetching Instagram posts: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    const posts = response.data.data;

    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(today.getDate() - 7); 

    const lastWeekPosts = posts.filter((post) => {
      const postDate = new Date(post.timestamp);
      return postDate >= lastWeekDate;
    });

    let totalPosts = 0,
    totalLikes = 0,
    totalShares = 0,
    totalComments = 0,
    totalViews = 0,
    totalReach = 0,
    maxPost = 0,
    topPostID = null;
    let totalInteractions = 0;

    for (let post of lastWeekPosts) {
      // Fetch insights for each post
      const insightsResponse: any = await axios
        .get(
          `https://graph.instagram.com/v22.0/${post.id}/insights?metric=likes,comments,reach,shares,views,total_interactions&period=lifetime&access_token=${accessToken}`,
        )
        .catch((error) => {
          console.log(error.response.data);
          throw new HttpException(
            `Error fetching Instagram post insights: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });

      const insights = insightsResponse.data.data;

      console.log(post)
      console.log(insights)

      let likesCount = 0;
      let commentsCount = 0;
      let sharesCount = 0;
      let reachCount = 0;
      let viewsCount = 0;
      let interactionsCount = 0;

      // Extract the necessary metrics from insights
      for (let metric of insights) {
        if (metric.name === 'likes') likesCount = metric.values[0].value;
        if (metric.name === 'comments') commentsCount = metric.values[0].value;
        if (metric.name === 'shares') sharesCount = metric.values[0].value;
        if (metric.name === 'reach') reachCount = metric.values[0].value;
        if (metric.name === 'views') viewsCount = metric.values[0].value;
        if (metric.name === 'total_interactions') interactionsCount = metric.values[0].value;
      }

      totalPosts++;
      totalLikes += likesCount;
      totalShares += sharesCount;
      totalComments += commentsCount;
      totalReach += reachCount;
      totalViews += viewsCount;
      totalInteractions += interactionsCount;

      if (interactionsCount > maxPost) {
        maxPost = interactionsCount;
        topPostID = post.id;
      }

      // Save Instagram post data to the database
      await this.instagramPostsRepository.save({
        firebaseUID: body.firebaseUID,
        postID: post.id,
        instagramID: conn.instagramID,
        userName: conn.userName,
        mediaType: post.media_type,
        content: post.caption,
        createdAt: new Date(post.timestamp),
        likes: likesCount,
        comments: commentsCount,
        shares: sharesCount,
        views: viewsCount,
        reach: reachCount,
        totalInteractions: interactionsCount,
        shortcode: post.shortcode,
      });

      console.log('Saved post successfully:', post.id);
    }

    const accountInfo: any = await axios.get(`https://graph.instagram.com/me?fields=id,username,followers_count&access_token=${accessToken}`)
    .catch((error) => {
      console.log(error.response.data)
      throw new HttpException(
        `Error fetching facebook account info: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })
     const followersCount = accountInfo.data.followers_count;

     console.log(followersCount)

     const analysis: any = await this.generateWeeklyAnalysis(body.firebaseUID, conn.instagramID, weeksAvailable, 
      conn.userName, startDate, endDate, totalPosts, 
      followersCount, totalLikes, totalComments, 
      totalShares, totalViews, totalReach, totalInteractions, 
      topPostID);

      if(analysis) {
        console.log("instagram analysis successfully saved for week ", weeksAvailable + 1, "for user ", conn.userName )
        return true
      }
      return false

    } catch(error){
      console.log(error);
      throw new HttpException(
        `Error fetching instagram data: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async generateWeeklyAnalysis(firebaseUID: string, instagramID: string,
     weekNumber: number, userName: string, startDate: Date, endDate: Date
    , postsCount: number, followersCount: number, likesCount: number,
     commentsCount: number, sharesCount: number, viewsCount: number, 
    reachCount: number, totalInteractions: number, topPostID: string) {
    try {

      const saveInstagramAnalysis = await this.instagramAnalysisRepository.save({
        firebaseUID: firebaseUID,
        instagramID: instagramID,
        weekNumber: weekNumber + 1,
        postsCount: postsCount,
        likesCount: likesCount,
        commentsCount: commentsCount,
        sharesCount: sharesCount,
        viewsCount: viewsCount,
        reachCount: reachCount,
        totalInteractions: totalInteractions,
        userName: userName,
        followersCount: followersCount,
        engagementRate: (totalInteractions / followersCount) * 100,
        topPostID: topPostID,
        startDate: startDate,
        endDate: endDate
      })
      return true
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error saving instagram analysis: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }
  findAll() {
    return `This action returns all instagramScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instagramScheduler`;
  }

  update(id: number, updateInstagramSchedulerDto: any) {
    return `This action updates a #${id} instagramScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} instagramScheduler`;
  }
}
