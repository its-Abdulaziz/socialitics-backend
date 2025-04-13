import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { TiktokConnService } from 'src/connections/tiktok-conn/tiktok-conn.service';
import { TiktokPosts } from './entities/tiktok-posts.entity';
import { TiktokAnalysis } from './entities/tiktok-analysis.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class TiktokSchedulerService {

  constructor(    
    @Inject(forwardRef(() => TiktokConnService))
    private readonly tiktokConnService: TiktokConnService,
    @InjectRepository(TiktokPosts) private readonly tiktokPostsRepository: Repository<TiktokPosts>,
    @InjectRepository(TiktokAnalysis) private readonly tiktokAnalysisRepository: Repository<TiktokAnalysis>,
  ) {}

  async create(body: any) {

    try {
    const conn: any = await this.tiktokConnService.findOne(body.firebaseUID);

    if(conn.isExist != true) {
      throw new Error('Tiktok connection not exist for this user');
    }

    //const accessToken = await this.tiktokConnService.refreshToken({firebaseUID: body.firebaseUID})
    const accessToken:string = conn.accessToken.toString()

    console.log('accessToken ',accessToken);
    const lastWeek = await this.tiktokAnalysisRepository
    .createQueryBuilder('tiktok_analysis')
    .select('tiktok_analysis.weekNumber')
    .where('tiktok_analysis.firebaseUID = :firebaseUID', { firebaseUID: body.firebaseUID })  
    .orderBy('tiktok_analysis.weekNumber', 'DESC') 
    .limit(1)  
    .getOne(); 
    let startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let weeksAvailable = 0;
    if (lastWeek) {
      weeksAvailable = lastWeek.weekNumber;
    }

    console.log('weeksAvailable ',weeksAvailable);
    const endDate = new Date(Date.now());

    const response = await axios.post('https://open-api.tiktok.com/v2/video/list/?fields=id,embed_link,create_time,title,like_count,comment_count,share_count,view_count', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).catch((error) => {
      console.log(error.response.data)
      throw new HttpException(
        `Error fetching tiktok posts`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })

    console.log(response.data.data);
    const posts = response.data.data.videos;

    const today = new Date();
    const lastWeekDate = new Date(today.setDate(today.getDate() - 7));

    const lastWeekPosts = posts.filter(post => {
      const videoDate = new Date(post.create_time * 1000);  
      return videoDate >= lastWeekDate; 
    });
    let totalPosts = 0, totalLikes = 0, totalShares = 0, totalComments = 0, totalViews = 0, maxViews = 0, topPostID = null;

    for (let post of lastWeekPosts) {
      console.log(post);
      totalPosts++;

      totalLikes += post.like_count;
      totalShares += post.share_count;
      totalComments += post.comment_count;
      totalViews += post.view_count;

      if (post.view_count > maxViews) {
        maxViews = post.view_count;
        topPostID = post.id;
      }

      let savePost = await this.tiktokPostsRepository.save({
        postID: post.id,
        firebaseUID: body.firebaseUID,
        tiktokID: conn.tiktokID,
        userName: conn.userName,
        content: post.title,
        createdAt: new Date(post.create_time * 1000),
        shares: post.share_count,
        likes: post.like_count,
        comments: post.comment_count,
        views: post.view_count,
        embedUrl: post.embed_link,
      });
    } 

    console.log('tiktok posts saved to database successfully');

    const accountInfo = await axios.get(`https://open.tiktokapis.com/v2/user/info/?fields=open_id,follower_count`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const followerCount = accountInfo.data.data.user.follower_count;

    console.log(followerCount);
    /*
    const analysis = await this.generateWeekAnalysis(weeksAvailable, totalPosts, totalLikes,
       totalComments, totalShares, totalViews,
       topPostID, conn.tiktokID, conn.userName,
       body.firebaseUID, followerCount, startDate, endDate);

       if(analysis) {
        console.log("Tiktok Analysis data saved successfully for user ", conn.userName, " for week ", weeksAvailable + 1)
      }*/
       return true       

    } catch (error) {
    console.log(error);
    throw new HttpException(
      `Error fetching tiktok data: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

  async generateWeekAnalysis(lastWeek: number, totalPosts: number,
   totalLikes: number, totalComments: number,
    totalShares: number, totalViews: number, topPostID: string,
    tiktokID: string, userName: string, firebaseUID: string,
    followerCount: number, startDate: Date, endDate: Date
  ) {

    try {
      const saveWeekAnalysis = await this.tiktokAnalysisRepository.save({
        firebaseUID: firebaseUID,
        weekNumber: lastWeek + 1,
        tiktokID: tiktokID,
        userName: userName,
        postsCount: totalPosts,
        followersCount: followerCount,
        likesCount: totalLikes,
        commentsCount: totalComments,
        sharesCount: totalShares,
        viewsCount: totalViews,
        engagementRate: (((totalLikes + totalComments + totalShares) / (totalPosts )) / totalViews) * 100,
        topPostID: topPostID,
        startDate: startDate,
        endDate: endDate
      });
      return true

    } catch (error) {
      throw new HttpException(
        `Error saving tiktok week analysis ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return true

    }

  findAll() {
    return `This action returns all tiktokScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiktokScheduler`;
  }

  update(id: number, updateTiktokSchedulerDto: any) {
    return `This action updates a #${id} tiktokScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} tiktokScheduler`;
  }
}
