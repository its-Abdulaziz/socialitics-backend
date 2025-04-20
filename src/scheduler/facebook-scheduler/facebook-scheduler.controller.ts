import { Controller, Get, Post, Query, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  findAll(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.facebookSchedulerService.getFacebookAnalysis(firebaseUID,req);
  }

  @Get('topPosts')
  findTopPosts(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.facebookSchedulerService.getTopPosts(firebaseUID ,req);
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
