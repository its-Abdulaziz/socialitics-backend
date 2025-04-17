import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FacebookSchedulerService } from './facebook-scheduler.service';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';


@UseGuards(FirebaseAuthGuard)
@Controller('facebook/scheduler')
export class FacebookSchedulerController {
  constructor(private readonly facebookSchedulerService: FacebookSchedulerService) {}

  @NoAuth()
  @Post()
  create(@Body() body: any) {
    return this.facebookSchedulerService.create(body);
  }

  @NoAuth()
  @Get('analysis')
  findAll(@Body() body: any) {
    return this.facebookSchedulerService.getFacebookAnalysis(body);
  }

  @NoAuth()
  @Get('topPosts')
  findTopPosts(@Body() body: any) {
    return this.facebookSchedulerService.getTopPosts(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facebookSchedulerService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facebookSchedulerService.remove(+id);
  }
}
