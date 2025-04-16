import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacebookSchedulerService } from './facebook-scheduler.service';

@Controller('facebook/scheduler')
export class FacebookSchedulerController {
  constructor(private readonly facebookSchedulerService: FacebookSchedulerService) {}

  @Post()
  create(@Body() body: any) {
    return this.facebookSchedulerService.create(body);
  }

  @Get()
  findAll() {
    return this.facebookSchedulerService.findAll();
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
