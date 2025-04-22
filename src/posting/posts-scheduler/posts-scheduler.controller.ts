import { Controller, Get, Post, Request, Body, Patch, Param, Delete, Query, UseGuards, HttpException, HttpStatus, Put } from '@nestjs/common';
import { PostsSchedulerService } from './posts-scheduler.service';
import { CreatePostsSchedulerDto } from './dto/create-posts-scheduler.dto';
import { UpdatePostsSchedulerDto } from './dto/update-posts-scheduler.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('posts/scheduler')
export class PostsSchedulerController {
  constructor(private readonly postsSchedulerService: PostsSchedulerService) {}

  @NoAuth()
  @Get('scheduledPosts')
  getScheduledPosts() {
    return this.postsSchedulerService.getScheduledPosts();
  }

  @Post('twitter')
  schedulePostTwitter(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can schedule posts on your own account only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.schedulePostTwitter(body);
  }
  @Post('tiktok')
  schedulePostTiktok(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can schedule posts on your own account only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.schedulePostTiktok(body);
  }
  @Post('instagram')
  schedulePostInstagram(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can schedule posts on your own account only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.schedulePostInstagram(body);
  }
  @Post('facebook')
  schedulePostFacebook(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can schedule posts on your own account only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.schedulePostFacebook(body);
  }

  @Get('userPosts')
  getUserPosts(@Query() firebaseUID: string, @Request() request: any) {
    if(firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can view your own posts only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.getUserPosts(firebaseUID);
  }

  @Delete('deletePost')
  remove(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can delete your own posts only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.remove(body);
  }

  @Put('updatePost')
  updatePost(@Body() body: any, @Request() request: any) {
    if(body.firebaseUID != request.currentUser.firebaseUID) {
      throw new HttpException(
        `You can update your own posts only!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.postsSchedulerService.updatePost(body);
  }
}
