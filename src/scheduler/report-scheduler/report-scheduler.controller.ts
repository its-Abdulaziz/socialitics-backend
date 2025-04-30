import { Controller, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common';
import { ReportSchedulerService } from './report-scheduler.service';
import { CreateReportSchedulerDto } from './dto/create-report-scheduler.dto';
import { UpdateReportSchedulerDto } from './dto/update-report-scheduler.dto';

@Controller('report/scheduler')
export class ReportSchedulerController {
  constructor(private readonly reportSchedulerService: ReportSchedulerService) {}


  @Post()
  create(@Query() query: any) {
    return this.reportSchedulerService.create(query.firebaseUID);
  }

  @Get()
  findAll() {
    return this.reportSchedulerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportSchedulerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportSchedulerDto: UpdateReportSchedulerDto) {
    return this.reportSchedulerService.update(+id, updateReportSchedulerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportSchedulerService.remove(+id);
  }
}
