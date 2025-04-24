import { Controller, Get, UseGuards,Query,Request, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TwitterSchedulerService } from './twitter-scheduler.service';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';
import { query } from 'express';

@Controller('twitter/scheduler')
@UseGuards(FirebaseAuthGuard)
export class TwitterSchedulerController {
  constructor(private readonly twitterSchedulerService: TwitterSchedulerService) {}

  @NoAuth()
  @Post()
  getTwiiterTweets(@Body() body: any) {
    return this.twitterSchedulerService.getTwitterTweets(body);
  }

  @Get('analysis')
  getTwitterAnalysis(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.twitterSchedulerService.getTwitterAnalysis(firebaseUID, req);
  }

  @Get('topTweets')
  getTopTweets(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.twitterSchedulerService.getTopTweets(firebaseUID, req);
  }

  @Get()
  findAll() {
    return this.twitterSchedulerService.findAll();
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
