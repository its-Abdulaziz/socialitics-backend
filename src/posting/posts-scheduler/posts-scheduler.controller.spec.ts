import { Test, TestingModule } from '@nestjs/testing';
import { PostsSchedulerController } from './posts-scheduler.controller';
import { PostsSchedulerService } from './posts-scheduler.service';

describe('PostsSchedulerController', () => {
  let controller: PostsSchedulerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsSchedulerController],
      providers: [PostsSchedulerService],
    }).compile();

    controller = module.get<PostsSchedulerController>(PostsSchedulerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
