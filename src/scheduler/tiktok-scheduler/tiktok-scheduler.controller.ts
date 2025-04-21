import { Controller,Request, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TiktokSchedulerService } from './tiktok-scheduler.service';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';
import { UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';


@UseGuards(FirebaseAuthGuard)
@Controller('tiktok/scheduler')
export class TiktokSchedulerController {
  constructor(private readonly tiktokSchedulerService: TiktokSchedulerService) {}

  @NoAuth()
  @Post()
  create(@Body() body: any) {
    return this.tiktokSchedulerService.create(body);
  }

  @Get()
  findAll() {
    return this.tiktokSchedulerService.findAll();
  }

  @Get('analysis')
  getTiktokAnalysis(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.tiktokSchedulerService.getTiktokAnalysis(firebaseUID, req);
  }

  @Get('topPosts')
  getTopPosts(@Query() query: any, @Request()req: any) {
    const firebaseUID = query.firebaseUID;
    return this.tiktokSchedulerService.getTopPosts(firebaseUID, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiktokSchedulerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTiktokSchedulerDto: any) {
    return this.tiktokSchedulerService.update(+id, updateTiktokSchedulerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiktokSchedulerService.remove(+id);
  }
}
