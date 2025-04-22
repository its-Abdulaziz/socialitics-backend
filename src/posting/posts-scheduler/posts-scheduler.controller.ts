import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostsSchedulerService } from './posts-scheduler.service';
import { CreatePostsSchedulerDto } from './dto/create-posts-scheduler.dto';
import { UpdatePostsSchedulerDto } from './dto/update-posts-scheduler.dto';

@Controller('posts/scheduler')
export class PostsSchedulerController {
  constructor(private readonly postsSchedulerService: PostsSchedulerService) {}

  @Post()
  create(@Body() createPostsSchedulerDto: CreatePostsSchedulerDto) {
    return this.postsSchedulerService.create(createPostsSchedulerDto);
  }

  @Get('scheduledPosts')
  getScheduledPosts() {
    return this.postsSchedulerService.getScheduledPosts();
  }
  @Post('twitter')
  schedulePostTwitter(@Body() body: any) {
    return this.postsSchedulerService.schedulePostTwitter(body);
  }
  @Post('tiktok')
  schedulePostTiktok(@Body() body: any) {
    return this.postsSchedulerService.schedulePostTiktok(body);
  }
  @Post('instagram')
  schedulePostInstagram(@Body() body: any) {
    return this.postsSchedulerService.schedulePostInstagram(body);
  }
  @Post('facebook')
  schedulePostFacebook(@Body() body: any) {
    return this.postsSchedulerService.schedulePostFacebook(body);
  }

  @Get()
  findAll() {
    return this.postsSchedulerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsSchedulerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostsSchedulerDto: UpdatePostsSchedulerDto) {
    return this.postsSchedulerService.update(+id, updatePostsSchedulerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsSchedulerService.remove(+id);
  }
}
