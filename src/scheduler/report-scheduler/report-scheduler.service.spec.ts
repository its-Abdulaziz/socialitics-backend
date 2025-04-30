import { Test, TestingModule } from '@nestjs/testing';
import { ReportSchedulerService } from './report-scheduler.service';

describe('ReportSchedulerService', () => {
  let service: ReportSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportSchedulerService],
    }).compile();

    service = module.get<ReportSchedulerService>(ReportSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
