import { PartialType } from '@nestjs/mapped-types';
import { CreateReportSchedulerDto } from './create-report-scheduler.dto';

export class UpdateReportSchedulerDto extends PartialType(CreateReportSchedulerDto) {}
