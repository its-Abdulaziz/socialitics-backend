import { Test, TestingModule } from '@nestjs/testing';
import { PostsSchedulerService } from './posts-scheduler.service';

describe('PostsSchedulerService', () => {
  let service: PostsSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsSchedulerService],
    }).compile();

    service = module.get<PostsSchedulerService>(PostsSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
