import { Controller, Get, Post, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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

  @Get('analysis')
  findAll(@Body() body: any, @Request()req: any) {
    return this.facebookSchedulerService.getFacebookAnalysis(body,req);
  }

  @Get('topPosts')
  findTopPosts(@Body() body: any, @Request()req: any) {
    return this.facebookSchedulerService.getTopPosts(body,req);
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
