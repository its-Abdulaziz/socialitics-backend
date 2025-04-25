import { Test, TestingModule } from '@nestjs/testing';
import { DeepseekTipsService } from './deepseek-tips.service';

describe('DeepseekTipsService', () => {
  let service: DeepseekTipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeepseekTipsService],
    }).compile();

    service = module.get<DeepseekTipsService>(DeepseekTipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
