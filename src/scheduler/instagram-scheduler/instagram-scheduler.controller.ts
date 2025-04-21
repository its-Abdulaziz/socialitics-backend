import { Controller, Get, Post, Body,Request, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InstagramSchedulerService } from './instagram-scheduler.service';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('instagram/scheduler')
export class InstagramSchedulerController {
  constructor(private readonly instagramSchedulerService: InstagramSchedulerService) {}


  @Post()
  create(@Body() body: any) {
    return this.instagramSchedulerService.create(body);
  }

  @Get('analysis')
  getInstagramAnalysis(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.instagramSchedulerService.getInstagramAnalysis(firebaseUID,req);
  }

  @Get('topPosts')
  getTopPosts(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.instagramSchedulerService.getTopPosts(firebaseUID,req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instagramSchedulerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstagramSchedulerDto: any) {
    return this.instagramSchedulerService.update(+id, updateInstagramSchedulerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instagramSchedulerService.remove(+id);
  }
}
