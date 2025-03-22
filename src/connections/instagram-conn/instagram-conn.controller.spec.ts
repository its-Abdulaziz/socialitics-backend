import { Test, TestingModule } from '@nestjs/testing';
import { InstagramConnController } from './instagram-conn.controller';
import { InstagramConnService } from './instagram-conn.service';

describe('InstagramConnController', () => {
  let controller: InstagramConnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstagramConnController],
      providers: [InstagramConnService],
    }).compile();

    controller = module.get<InstagramConnController>(InstagramConnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
