import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TwitterSchedulerService } from './twitter-scheduler.service';

@Controller('twitter-scheduler')
export class TwitterSchedulerController {
  constructor(private readonly twitterSchedulerService: TwitterSchedulerService) {}

  @Post()
  getTwiiterTweets(@Body() body: any) {
    return this.twitterSchedulerService.getTwitterTweets(body);
  }

  @Get()
  findAll() {
    return this.twitterSchedulerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.twitterSchedulerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTwitterSchedulerDto: any) {
    return this.twitterSchedulerService.update(+id, updateTwitterSchedulerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.twitterSchedulerService.remove(+id);
  }
}
