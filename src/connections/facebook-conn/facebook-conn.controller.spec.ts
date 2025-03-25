import { Test, TestingModule } from '@nestjs/testing';
import { FacebookConnController } from './facebook-conn.controller';
import { FacebookConnService } from './facebook-conn.service';

describe('FacebookConnController', () => {
  let controller: FacebookConnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacebookConnController],
      providers: [FacebookConnService],
    }).compile();

    controller = module.get<FacebookConnController>(FacebookConnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
