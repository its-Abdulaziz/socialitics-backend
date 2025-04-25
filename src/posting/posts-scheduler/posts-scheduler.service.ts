import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePostsSchedulerDto } from './dto/create-posts-scheduler.dto';
import { UpdatePostsSchedulerDto } from './dto/update-posts-scheduler.dto';
import { TwitterConnService } from 'src/connections/twitter-conn/twitter-conn.service';
import { PostsScheduler } from './entities/posts-scheduler.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { TwitterApi } from 'twitter-api-v2';
import { TiktokConnService } from 'src/connections/tiktok-conn/tiktok-conn.service';
import axios from 'axios';
import { InstagramConnService } from 'src/connections/instagram-conn/instagram-conn.service';
import { FacebookConnService } from 'src/connections/facebook-conn/facebook-conn.service';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class PostsSchedulerService {
  constructor(
    @Inject(forwardRef(() => TwitterConnService)) private readonly twitterConnService: TwitterConnService,
    @Inject(forwardRef(() => TiktokConnService)) private readonly tiktokConnService: TiktokConnService,
    @Inject(forwardRef(() => InstagramConnService)) private readonly instagramConnService: InstagramConnService,
    @Inject(forwardRef(() => FacebookConnService)) private readonly facebookConnService: FacebookConnService,
    @InjectRepository(PostsScheduler) private readonly postsSchedulerRepository: Repository<PostsScheduler>,
  ) {}

  //@Cron('* * * * *')
  async getScheduledPosts() {
    const date = new Date()
    date.setHours(date.getHours() + 3)
    const posts = await this.postsSchedulerRepository.find({
      where: {
        scheduleDate: LessThanOrEqual(date),
        status: 'scheduled',
      }
    })
    console.log('posts to be published ',posts)
    for(const post of posts) {
      if(post.platform === 'twitter') {
        await this.publishPostTwitter(post)
      }
      else if(post.platform === 'tiktok') {
        await this.publishPostTiktok(post)
      }
      else if(post.platform === 'instagram') {
        await this.publishPostInstagram(post)
      }
      else {
        await this.publishPostFacebook(post)
      }
    }
    return posts
  }

  async schedulePostTwitter(body: any) {
    try {
    const savePost = await this.postsSchedulerRepository.save(
      {
        firebaseUID: body.firebaseUID,
        scheduleDate: body.scheduleDate,
        status: 'scheduled',
        platform: 'twitter',
        content: body.content,
      }
    )
    console.log("post scheduled successfully ",savePost)
  }catch(e) {
    console.log(e)
    throw new HttpException(
      `Error saving twitter scheduled post ${e}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async publishPostTwitter(body: any) { 
    console.log(body)
    try {

    const accessToken = await this.twitterConnService.refreshToken({firebaseUID: body.firebaseUID})
    const twitterClient = new TwitterApi(accessToken)
    const tweet = await twitterClient.v2.tweet(body.content)
    console.log("post ", body.postID, "successfully posted on twitter")
    await this.postsSchedulerRepository.update({postID: body.postID}, {
      status: 'published'
    })
    console.log("post ", body.postID, "updated to published")
    return true
    } catch (error) {
      console.error(error)
      throw new HttpException(
        `Error publishing post: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  create(createPostsSchedulerDto: CreatePostsSchedulerDto) {
    return 'This action adds a new postsScheduler';
  }

  async schedulePostTiktok(body: any) {
    const mediaType = this.isImageUrl(body.mediaUrl) ? 'image' : 'video';
    if(mediaType == 'image') {
      throw new HttpException(
        `only video allowed to schedule`,
        HttpStatus.BAD_REQUEST
      );
    }
    try {
    const savePost = await this.postsSchedulerRepository.save(
      {
        firebaseUID: body.firebaseUID,
        scheduleDate: body.scheduleDate,
        status: 'scheduled',
        platform: 'tiktok',
        content: body.content ?? null,
        mediaUrl: body.mediaUrl,
        mediaType: mediaType
      }
    )
    console.log("post scheduled successfully ",savePost)
  }catch(e) {
    console.log(e)
    throw new HttpException(
      `Error saving tiktok scheduled post ${e}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async publishPostTiktok(body: any) {
    try {
    const url = 'https://open.tiktokapis.com/v2/post/publish/video/init/'
    const accessToken = await this.tiktokConnService.refreshToken({firebaseUID: body.firebaseUID})

    const data = {
      post_info: {
        title: body.content ?? "",
        privacy_level: 'SELF_ONLY',
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: body.mediaUrl
      }
    };

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, data, { headers })
    .catch((error) => {  
      console.log(error)
      throw new HttpException(
        `Error publishing tiktok scheduled post ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });
    console.log('Response:', response.data);
    console.log("post ", body.postID, "successfully posted on tiktok")
    await this.postsSchedulerRepository.update({postID: body.postID}, {
      status: 'published'
    })
    console.log("post ", body.postID, "updated to published")
    return true
    } catch(e) {
    console.log(e)
    throw new HttpException(
      `Error processing tiktok scheduled post ${e}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async schedulePostInstagram(body: any) {
    const mediaType = this.isImageUrl(body.mediaUrl) ? 'image' : 'video';

    try {
    const savePost = await this.postsSchedulerRepository.save(
      {
        firebaseUID: body.firebaseUID,
        scheduleDate: body.scheduleDate,
        status: 'scheduled',
        platform: 'instagram',
        content: body.content ?? null,
        mediaUrl: body.mediaUrl,
        mediaType: mediaType
      }
    )
    console.log("post scheduled successfully ",savePost)

  } catch(e) {
    console.log(e)
    throw new HttpException(
      `Error saving instagram scheduled post ${e}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async publishPostInstagram(body: any) {
    try {
    const conn: any = await this.instagramConnService.findOne(body.firebaseUID)
    let requestBody = {}
    if(this.isImageUrl(body.mediaUrl)) {
      requestBody = {
        image_url: body.mediaUrl,
        caption: body.content ?? ""
      }
    }
    else {
      requestBody = {
        video_url: body.mediaUrl,
        caption: body.content ?? "",
        media_type: 'REELS',
        thumb_offset: 1000
      }
    }
    console.log(requestBody)
    const uploadMedia = await axios.post(`https://graph.instagram.com/${conn.instagramID}/media?access_token=${conn.accessToken}`, requestBody)
    .catch((error) => {
      console.log(error.response.data)
      throw new HttpException(
        `Error uploading instagram media for posts ${body.postID}\n ${error.response.data}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });
    console.log("media uploaded successfully ", uploadMedia.data)

    let requestBody1 = { creation_id: uploadMedia.data.id}
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    await delay(10000)

    const publishMedia = await axios.post(`https://graph.instagram.com/${conn.instagramID}/media_publish?access_token=${conn.accessToken}`, requestBody1)
    .catch((error) => {
      console.log(error.response.data)
      throw new HttpException(
        `Error publishing instagram media for posts ${body.postID}\n ${error.response.data}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });
    console.log("media published successfully ", publishMedia.data)

    await this.postsSchedulerRepository.update({postID: body.postID}, {
      status: 'published'
    })
    console.log("post ", body.postID, "updated to published")
    return true

    } catch(e) {
      console.log(e)
      throw new HttpException(
        `Error processing instagram scheduled post ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async schedulePostFacebook(body: any) {
    let mediaType
    if(body.mediaUrl) {
     mediaType = this.isImageUrl(body.mediaUrl) ? 'image' : 'video';
  }
    try {
    const savePost = await this.postsSchedulerRepository.save(
      {
        firebaseUID: body.firebaseUID,
        scheduleDate: body.scheduleDate,
        status: 'scheduled',
        platform: 'facebook',
        content: body.content ?? null,
        mediaUrl: body.mediaUrl ?? null,
        mediaType: mediaType ?? null
      }
    )
    console.log("post scheduled successfully  ",savePost)

  } catch(e) {
    console.log(e)
    throw new HttpException(
      `Error saving facebook scheduled post ${e}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async publishPostFacebook(body: any) {
    try {
      let url = ''
      let requestBody = {}
      const conn: any = await this.facebookConnService.findOne(body.firebaseUID)
      if(body.mediaUrl) {
        if(body.mediaType == 'image') {
          url = `https://graph.facebook.com/v22.0/${conn.pageID}/photos?access_token=${conn.pageAccessToken}`
          requestBody = {
            url: body.mediaUrl,
            message: body.content ?? ""
          }
        } 
        else {
          url = `https://graph.facebook.com/v22.0/${conn.pageID}/videos?access_token=${conn.pageAccessToken}`
          requestBody = {
            file_url: body.mediaUrl,
            description: body.content ?? ""
          }
        }
      }
      else {
        url = `https://graph.facebook.com/v22.0/${conn.pageID}/feed?access_token=${conn.pageAccessToken}`
        requestBody = {
          message: body.content ?? ""
        }
      }

      const response = await axios.post(url, requestBody)
      .catch((error) => {
        console.log(error.response.data)
        throw new HttpException(
          `Error publishing facebook post for posts ${body.postID}\n ${error.response.data}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
      console.log("post published successfully ", response.data)

      await this.postsSchedulerRepository.update({postID: body.postID}, {
        status: 'published'
      })
      console.log("post ", body.postID, "updated to published")
      return true

    } catch(e) {
      console.log(e)
      throw new HttpException(
        `Error processing facebook scheduled post ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async getUserPosts(firebaseUID: string) {
    try {

    return await this.postsSchedulerRepository.find(
      {
        where: {firebaseUID: firebaseUID},
        order: {
         scheduleDate: 'DESC'}
        })
    
  } catch(e) {
      console.log(e)
      throw new HttpException(
        `Error getting user posts ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  findAll() {
    return `This action returns all postsScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postsScheduler`;
  }

  update(id: number, updatePostsSchedulerDto: UpdatePostsSchedulerDto) {
    return `This action updates a #${id} postsScheduler`;
  }

  async remove(body: any) {
    try {

      const getPost = await this.postsSchedulerRepository.findOne(
        {
          where: {
            postID: body.postID
          }
        }
      )

      if(!getPost || getPost.status != 'scheduled') {
        throw new HttpException(
          `Post not fount or can not be deleted`,
          HttpStatus.BAD_REQUEST
        );
      }

      if( getPost.firebaseUID != body.firebaseUID) {
        throw new HttpException(
          `You can't delete this post`,
          HttpStatus.UNAUTHORIZED
        );
      }

    const deletePost = await this.postsSchedulerRepository.delete(
      {postID: body.postID}
    )
      return deletePost 
    } catch(e) {
      console.log(e.response.data)
      throw new HttpException(
      `Error deleting post ${e.response.data}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
   }
  }

  async updatePost(body: any) {
    try {

      const getPost = await this.postsSchedulerRepository.findOne(
        {
          where: {
            postID: body.postID
          }
        }
      )
      if(!getPost || getPost.status != 'scheduled') {
        throw new HttpException(
          `Post not fount or not scheduled`,
          HttpStatus.BAD_REQUEST
        );
      }

      if( getPost.firebaseUID != body.firebaseUID) {
        throw new HttpException(
          `You can't update this post`,
          HttpStatus.UNAUTHORIZED
        );
      }

      const updatePost = await this.postsSchedulerRepository.update(
        {postID: body.postID},
        {
          status: 'scheduled',
          scheduleDate: new Date()
        }
      )
        return updatePost 
      } catch(e) {
        console.log(e.response.data)
        throw new HttpException(
        `Error updating post ${e.response.data}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
     }
    }

  isImageUrl(url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(extension => url.toLowerCase().endsWith(extension));
  }
}
