import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TiktokSchedulerService } from './tiktok-scheduler.service';


@Controller('tiktok/scheduler')
export class TiktokSchedulerController {
  constructor(private readonly tiktokSchedulerService: TiktokSchedulerService) {}

  @Post()
  create(@Body() body: any) {
    return this.tiktokSchedulerService.create(body);
  }

  @Get()
  findAll() {
    return this.tiktokSchedulerService.findAll();
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
