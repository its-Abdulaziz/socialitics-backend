import { Controller, Get, UseGuards,Query,Request, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TwitterSchedulerService } from './twitter-scheduler.service';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';

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
  getTwitterAnalysis(@Body() body: any, @Request()req: any) {
    return this.twitterSchedulerService.getTwitterAnalysis(body, req);
  }

  @Get('topTweets')
  getTopTweets(@Body() body: any, @Request()req: any) {
    return this.twitterSchedulerService.getTopTweets(body, req);
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
