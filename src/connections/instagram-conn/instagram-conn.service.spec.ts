import { Test, TestingModule } from '@nestjs/testing';
import { InstagramConnService } from './instagram-conn.service';

describe('InstagramConnService', () => {
  let service: InstagramConnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstagramConnService],
    }).compile();

    service = module.get<InstagramConnService>(InstagramConnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
