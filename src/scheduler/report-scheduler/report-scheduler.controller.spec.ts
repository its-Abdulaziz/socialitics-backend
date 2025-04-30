import { Test, TestingModule } from '@nestjs/testing';
import { ReportSchedulerController } from './report-scheduler.controller';
import { ReportSchedulerService } from './report-scheduler.service';

describe('ReportSchedulerController', () => {
  let controller: ReportSchedulerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportSchedulerController],
      providers: [ReportSchedulerService],
    }).compile();

    controller = module.get<ReportSchedulerController>(ReportSchedulerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
