import { Test, TestingModule } from '@nestjs/testing';
import { DeepseekTipsController } from './deepseek-tips.controller';
import { DeepseekTipsService } from './deepseek-tips.service';

describe('DeepseekTipsController', () => {
  let controller: DeepseekTipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeepseekTipsController],
      providers: [DeepseekTipsService],
    }).compile();

    controller = module.get<DeepseekTipsController>(DeepseekTipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
