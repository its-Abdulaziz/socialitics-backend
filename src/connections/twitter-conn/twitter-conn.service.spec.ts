import { Test, TestingModule } from '@nestjs/testing';
import { TwitterConnService } from './twitter-conn.service';

describe('TwitterConnService', () => {
  let service: TwitterConnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwitterConnService],
    }).compile();

    service = module.get<TwitterConnService>(TwitterConnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
