import { Test, TestingModule } from '@nestjs/testing';
import { TiktokConnController } from './tiktok-conn.controller';
import { TiktokConnService } from './tiktok-conn.service';

describe('TiktokConnController', () => {
  let controller: TiktokConnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiktokConnController],
      providers: [TiktokConnService],
    }).compile();

    controller = module.get<TiktokConnController>(TiktokConnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
