import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { TiktokConnService } from 'src/connections/tiktok-conn/tiktok-conn.service';
import { TiktokPosts } from './entities/tiktok-posts.entity';
import { TiktokAnalysis } from './entities/tiktok-analysis.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class TiktokSchedulerService {

  constructor(    
    @Inject(forwardRef(() => TiktokConnService))
    private readonly tiktokConnService: TiktokConnService,
    @InjectRepository(TiktokPosts) private readonly tiktokPostsRepository: Repository<TiktokPosts>,
    @InjectRepository(TiktokAnalysis) private readonly tiktokAnalysisRepository: Repository<TiktokAnalysis>,
  ) {}


  @Cron('28 23 * * 2')
  async create(body: any) {

    const firebaseUID = 'VpJOUX05QSh86FNf44Gb4jGYEF02'
    try {
    const conn: any = await this.tiktokConnService.findOne(firebaseUID);

    if(conn.isExist != true) {
      throw new Error('Tiktok connection not exist for this user');
    }

    const accessToken = await this.tiktokConnService.refreshToken({firebaseUID: firebaseUID})
    //const accessToken:string = conn.accessToken.toString()

    console.log('accessToken ',accessToken);
    const lastWeek = await this.tiktokAnalysisRepository
    .createQueryBuilder('tiktok_analysis')
    .select('tiktok_analysis.weekNumber')
    .where('tiktok_analysis.firebaseUID = :firebaseUID', { firebaseUID: firebaseUID })  
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

    const response:any = await fetch(
      'https://open-api.tiktok.com/v2/video/list/?fields=id,embed_link,create_time,title,like_count,comment_count,share_count,view_count',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch((error) => {
      console.log(error.response.data)
      throw new HttpException(
        `Error fetching tiktok posts`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     })

    const data = await response.json();

    console.log(data.data.videos);
    const posts = data.data.videos

    const today = new Date();
    const lastWeekDate = new Date(today.setDate(today.getDate() - 7));

    const lastWeekPosts = posts.filter(post => {
      const videoDate = new Date(post.create_time * 1000);  
      return videoDate >= lastWeekDate; 
    });
    let totalPosts = 0, totalLikes = 0, totalShares = 0, totalComments = 0, totalViews = 0, maxViews = 0, topPostID = null;

    for (let post of lastWeekPosts) {
      totalPosts++;

      totalLikes += post.like_count;
      totalShares += post.share_count;
      totalComments += post.comment_count;
      totalViews += post.view_count;

      if (post.view_count >= maxViews) {
        maxViews = post.view_count;
        topPostID = post.id;
      }

      let savePost = await this.tiktokPostsRepository.save({
        postId: post.id,
        firebaseUID: firebaseUID,
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

    const followersCount = accountInfo.data.data.user.follower_count;

    console.log(followersCount);
    
    const analysis = await this.generateWeekAnalysis(weeksAvailable, totalPosts, totalLikes,
       totalComments, totalShares, totalViews,
       topPostID, conn.tiktokID, conn.userName,
       firebaseUID, followersCount, startDate, endDate);

       if(analysis) {
        console.log("Tiktok Analysis data saved successfully for user ", conn.userName, " for week ", weeksAvailable + 1)
        return true
      }
       return false       

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
        engagementRate: (((totalLikes + totalComments + totalShares) / (totalPosts)) / totalViews) * 100,
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
  }


 async getTiktokAnalysis(firebaseUID: any, req: any){

  if(firebaseUID != req.currentUser.firebaseUID) {
    throw new HttpException("You can get only your own data",HttpStatus.BAD_REQUEST)
  }

  const analysis = await this.tiktokAnalysisRepository.find({
    where: {
      firebaseUID: firebaseUID
    },
    order: { weekNumber: 'ASC' },
  }).catch((error) => {
    console.log(error)
    throw new HttpException(
      `Error getting tiktok analysis from database${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   })
  if (!analysis || analysis.length === 0) {
    throw new Error('No tiktok analysis found for this user');
  }

  let transformedData = {
    firebaseUID: analysis[0].firebaseUID,
    tiktokID: analysis[0].tiktokID,
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
    const analysis = await this.tiktokAnalysisRepository.find({
      where: {
        firebaseUID: firebaseUID
      },
      order: { weekNumber: 'ASC' },
    })
    let posts = []
    for (const week of analysis) {        
      const topPost = await this.tiktokPostsRepository.find({
          where: {
            postId: week.topPostID
          }
        });
        posts.push({
          weekNumber: week.weekNumber,
          postId: topPost[0].postId,
          userName: topPost[0].userName,
          content: topPost[0].content,
          likes: topPost[0].likes,
          comments: topPost[0].comments,
          views: topPost[0].views,
          shares: topPost[0].shares,
          embedUrl: topPost[0].embedUrl
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

  private formatDate(date: Date): string {
    return `${date.getUTCDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getUTCFullYear()}`;
  }
}
