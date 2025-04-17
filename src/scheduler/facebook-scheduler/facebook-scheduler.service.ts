import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FacebookConnService } from 'src/connections/facebook-conn/facebook-conn.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacebookPosts } from './entities/facebook-posts.entity';
import { FacebookAnalysis } from './entities/facebook-analysis.entity';
import axios from 'axios';

@Injectable()
export class FacebookSchedulerService {
  constructor(
    @Inject(forwardRef(() => FacebookConnService))
    private readonly facebookConnService: FacebookConnService,
    @InjectRepository(FacebookPosts) private readonly facebookPostsRepository: Repository<FacebookPosts>,
    @InjectRepository(FacebookAnalysis) private readonly facebookAnalysisRepository: Repository<FacebookAnalysis>,
  ) 
  {}
  async create(body: any) {
    try{
      
      const conn: any = await this.facebookConnService.findOne(body.firebaseUID);
      if(conn.isExist != true) {
        throw new Error('Facebook connection not exist for this user');
      }

      const pageAccessToken = conn.pageAccessToken

      const lastWeek = await this.facebookAnalysisRepository
      .createQueryBuilder('facebook_analysis')
      .select('facebook_analysis.weekNumber')
      .where('facebook_analysis.firebaseUID = :firebaseUID', { firebaseUID: body.firebaseUID })  
      .orderBy('facebook_analysis.weekNumber', 'DESC') 
      .limit(1)  
      .getOne(); 
      let startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let weeksAvailable = 0;
      if (lastWeek) {
        weeksAvailable = lastWeek.weekNumber;
      }
  
      console.log('weeksAvailable ',weeksAvailable);
      const endDate = new Date(Date.now());

      console.log(conn)
      const response: any = await axios.get(`https://graph.facebook.com/v22.0/${conn.pageID}/posts?
        fields=id,message,created_time,permalink_url,full_picture,reactions.type(HAHA).limit(0).summary(true).as(haha)
        ,shares,reactions.type(LOVE).limit(0).summary(true).as(heart)
        ,likes.summary(true),comments.summary(true)&access_token=${pageAccessToken}`)
        .catch((error) => {
          console.log(error.response.data)
          throw new HttpException(
            `Error fetching facebook posts: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
         })

      const posts = response.data.data;

      const today = new Date();  
      const lastWeekDate = new Date(today); 
      lastWeekDate.setDate(today.getDate() - 21);  
            
      const lastWeekPosts = posts.filter(post => {
          const postDate = new Date(post.created_time);  
          return postDate >= lastWeekDate;  
      });
      let totalPosts = 0, totalLikes = 0, totalShares = 0, totalComments = 0, totalHahas = 0, totalLoves = 0, maxPost = 0, topPostID = null;

      for(let post of lastWeekPosts){
        let numOfComments = post.comments?.data?.length ?? 0
        let shares = post.shares?.count ?? 0

        totalPosts++
        totalLikes += post.likes.summary.total_count
        totalShares += shares
        totalComments += numOfComments
        totalHahas += post.haha.summary.total_count
        totalLoves += post.heart.summary.total_count

        if(post.likes.summary.total_count + post.haha.summary.total_count + post.heart.summary.total_count > maxPost){
          maxPost = post.likes.summary.total_count + post.haha.summary.total_count + post.heart.summary.total_count
          topPostID = post.id
        }

        let savePost = await this.facebookPostsRepository.save({
          firebaseUID: body.firebaseUID,
          content: post.message,
          userName: conn.name,
          postID: post.id,
          pageID: conn.pageID,
          createdAt: post.created_time,
          likes: post.likes.summary.total_count,
          comments: numOfComments,
          haha: post.haha.summary.total_count,
          love: post.heart.summary.total_count,
          shares: shares,
          permalinkUrl: post.permalink_url
        });
        console.log("savePost successfully ", post.id)
      }
      const accountInfo: any = await axios.get(`https://graph.facebook.com/v22.0/${conn.pageID}?fields=followers_count&access_token=${pageAccessToken}`)
      .catch((error) => {
        console.log(error.response.data)
        throw new HttpException(
          `Error fetching facebook account info: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
       })
       const followersCount = accountInfo.data.followers_count

       const analysis = await this.generateWeeklyAnalysis(body.firebaseUID, 
        weeksAvailable, totalPosts, totalLikes, totalShares, totalComments, 
        totalHahas, totalLoves, conn.pageID, conn.name, 
        followersCount, topPostID, startDate, endDate)

        if(analysis) {
          console.log("facebook analysis successfully saved for week ", weeksAvailable + 1, "for user ", conn.name )
          return true
        }
        return false
    }catch (error) {
      console.log(error);
      throw new HttpException(
        `Error fetching facebook data: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateWeeklyAnalysis(firebaseUID: string, weekNumber: number, totalPosts: number, 
    totalLikes: number, totalShares: number, 
    totalComments: number, totalHahas: number, totalLoves: number,
    pageID: string, userName: string, followerCount: number,
    topPostID: string, startDate: Date, endDate: Date) {
    
      try {

        const saveFacebookAnalysis = await this.facebookAnalysisRepository.save({
          firebaseUID: firebaseUID,
          weekNumber: weekNumber + 1,
          postsCount: totalPosts,
          likesCount: totalLikes,
          sharesCount: totalShares,
          commentsCount: totalComments,
          hahaCount: totalHahas,
          loveCount: totalLoves,
          pageID: pageID,
          userName: userName,
          followersCount: followerCount,
          engagementRate: (((totalLikes + totalComments + totalShares) / (totalPosts)) / followerCount) * 100,
          topPostID: topPostID,
          startDate: startDate,
          endDate: endDate
        })
        return true
      }catch (error) {
        console.log(error);
        throw new HttpException(
          `Error saving facebook analysis: ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

  }

  findAll() {
    return `This action returns all facebookScheduler`;
  
    return `This action returns all facebookScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facebookScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} facebookScheduler`;
  }
}
