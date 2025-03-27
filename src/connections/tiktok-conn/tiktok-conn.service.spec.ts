import { Test, TestingModule } from '@nestjs/testing';
import { TiktokConnService } from './tiktok-conn.service';

describe('TiktokConnService', () => {
  let service: TiktokConnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiktokConnService],
    }).compile();

    service = module.get<TiktokConnService>(TiktokConnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
