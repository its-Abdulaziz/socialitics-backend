import { Test, TestingModule } from '@nestjs/testing';
import { FacebookConnService } from './facebook-conn.service';

describe('FacebookConnService', () => {
  let service: FacebookConnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacebookConnService],
    }).compile();

    service = module.get<FacebookConnService>(FacebookConnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
