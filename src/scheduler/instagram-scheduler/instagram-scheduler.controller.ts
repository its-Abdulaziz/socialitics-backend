import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstagramSchedulerService } from './instagram-scheduler.service';

@Controller('instagram/scheduler')
export class InstagramSchedulerController {
  constructor(private readonly instagramSchedulerService: InstagramSchedulerService) {}

  @Post()
  create(@Body() body: any) {
    return this.instagramSchedulerService.create(body);
  }

  @Get('analysis')
  getInstagramAnalysis(@Body() body: any) {
    return this.instagramSchedulerService.getInstagramAnalysis(body);
  }

  @Get('topPosts')
  getTopPosts(@Body() body: any) {
    return this.instagramSchedulerService.getTopPosts(body);
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
