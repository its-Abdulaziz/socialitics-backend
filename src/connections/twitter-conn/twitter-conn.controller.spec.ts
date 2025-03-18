import { Test, TestingModule } from '@nestjs/testing';
import { TwitterConnController } from './twitter-conn.controller';
import { TwitterConnService } from './twitter-conn.service';

describe('TwitterConnController', () => {
  let controller: TwitterConnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitterConnController],
      providers: [TwitterConnService],
    }).compile();

    controller = module.get<TwitterConnController>(TwitterConnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
