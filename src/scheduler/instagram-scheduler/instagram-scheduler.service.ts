import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InstagramConnService } from 'src/connections/instagram-conn/instagram-conn.service';
import { InstagramPosts } from './entities/instagram-posts.entity';
import { InstagramAnalysis } from './entities/instagram-analysis.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class InstagramSchedulerService {
  constructor(    
    @Inject(forwardRef(() => InstagramConnService))
    private readonly instagramConnService: InstagramConnService,
    @InjectRepository(InstagramPosts) private readonly instagramPostsRepository: Repository<InstagramPosts>,
    @InjectRepository(InstagramAnalysis) private readonly instagramAnalysisRepository: Repository<InstagramAnalysis>,
  ) {}

  @Cron('29 20 * * 2')
  async create(body: any) {

    const firebaseUID = 'VpJOUX05QSh86FNf44Gb4jGYEF02'
    try {

      const conn: any = await this.instagramConnService.findOne(firebaseUID);
      if (!conn.isExist) {
        throw new Error('Instagram connection not exist for this user');
      }

      const accessToken = conn.accessToken;

      const lastWeek = await this.instagramAnalysisRepository
        .createQueryBuilder('instagram_analysis')
        .select('instagram_analysis.weekNumber')
        .where('instagram_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })
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

      if (interactionsCount >= maxPost) {
        maxPost = interactionsCount;
        topPostID = post.id;
      }

      // Save Instagram post data to the database
      await this.instagramPostsRepository.save({
        firebaseUID: firebaseUID,
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

     const analysis: any = await this.generateWeeklyAnalysis(firebaseUID, conn.instagramID, weeksAvailable, 
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

  async getInstagramAnalysis(firebaseUID: any, req: any){

    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can get only your own data",HttpStatus.BAD_REQUEST)
    }

    const analysis = await this.instagramAnalysisRepository.find({
      where: {
        firebaseUID: firebaseUID
      },
      order: { weekNumber: 'ASC' },
    }).catch((error) => {
      console.log(error)
      throw new HttpException(
        `Error getting instagram analysis from database${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })
    if (!analysis || analysis.length === 0) {
      throw new Error('No instagram analysis found for this user');
    }

    let transformedData = {
      firebaseUID: analysis[0].firebaseUID,
      instagramID: analysis[0].instagramID,
      userName: analysis[0].userName,
      data: []
    };

    analysis.forEach((week, index, weeksArray) => {
      const prevWeek = weeksArray[index - 1];
  
      const diffFollowers = prevWeek ? week.followersCount - prevWeek.followersCount : 0;
      const diffPosts = prevWeek ? week.postsCount - prevWeek.postsCount : 0;
      const diffLikes = prevWeek ? week.likesCount - prevWeek.likesCount : 0;
      const diffComments = prevWeek ? week.commentsCount - prevWeek.commentsCount : 0;
      const diffViews = prevWeek ? week.viewsCount - prevWeek.viewsCount : 0;
      const diffReach = prevWeek ? week.reachCount - prevWeek.reachCount : 0;
      const diffInteractions = prevWeek ? week.totalInteractions - prevWeek.totalInteractions : 0;
      const diffEngagements = prevWeek ? (week.engagementRate - prevWeek.engagementRate) : 0;
      const diffShares = prevWeek ? week.sharesCount - prevWeek.sharesCount : 0;
      
      const formatDiff = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);
    
      transformedData.data.push({
        weekNumber: week.weekNumber,
        startDate: this.formatDate(week.startDate),
        endDate: this.formatDate(week.endDate),
        totalFollowers: week.followersCount,
        diffTotalFollowers: formatDiff(diffFollowers),
        numOfPosts: week.postsCount,
        diffNumOfPosts: formatDiff(diffPosts),
        totalLikes: week.likesCount,
        diffTotalLikes: formatDiff(diffLikes),
        totalShares: week.sharesCount,
        diffTotalShares: formatDiff(diffShares),
        totalComments: week.commentsCount,
        diffTotalComments: formatDiff(diffComments),
        totalViews: week.viewsCount,
        diffTotalViews: formatDiff(diffViews),
        totalReach: week.reachCount,
        diffTotalReach: formatDiff(diffReach),
        totalInteractions: week.totalInteractions,
        diffTotalInteractions: formatDiff(diffInteractions),
        engagementRate: week.engagementRate,
        diffEngagementRate: formatDiff(diffEngagements),
      });
    });
    return transformedData;
  }

  async getTopPosts(firebaseUID: any, req: any) {

    if(firebaseUID != req.currentUser.firebaseUID) {
      throw new HttpException("You can get only your own data",HttpStatus.BAD_REQUEST)
    }
    try{
    const analysis = await this.instagramAnalysisRepository.find({
      where: {
        firebaseUID: firebaseUID
      },
      order: { weekNumber: 'ASC' },
    })
    let posts = []
    for (const week of analysis) {        
      const topPost = await this.instagramPostsRepository.find({
          where: {
            postID: week.topPostID
          }
        });
        posts.push({
          weekNumber: week.weekNumber,
          postId: topPost[0].postID,
          userName: topPost[0].userName,
          content: topPost[0].content,
          likes: topPost[0].likes,
          comments: topPost[0].comments,
          views: topPost[0].views,
          shares: topPost[0].shares,
          reach: topPost[0].reach,
          interactions: topPost[0].totalInteractions,
          embedUrl: `https://www.instagram.com/p/${topPost[0].shortcode}/embed/`
        })
    }
    return posts
  } catch (error) {
    throw new HttpException(
      `Error getting top tiktok posts from database ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

  private formatDate(date: Date): string {
    return `${date.getUTCDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getUTCFullYear()}`;
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
