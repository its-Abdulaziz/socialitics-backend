import { Test, TestingModule } from '@nestjs/testing';
import { TwitterConnController } from './twitter-conn.controller';
import { TwitterConnService } from './twitter-conn.service';
import { CreateTwitterConnDto } from './dto/create-twitter-conn.dto'; // Ensure this path is correct
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('TwitterConnController', () => {
  let twitterConnController: TwitterConnController;
  let twitterConnService: TwitterConnService;

  const mockTwitterConnService = {
    connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitterConnController],
      providers: [
        {
          provide: TwitterConnService,
          useValue: mockTwitterConnService,
        },
      ],
    }).compile();

    twitterConnController = module.get<TwitterConnController>(TwitterConnController);
    twitterConnService = module.get<TwitterConnService>(TwitterConnService);
  });

  describe('connect', () => {
    const context: ExecutionContext = {} as ExecutionContext;
    const request = context.switchToHttp().getRequest()
    it('should connect to Twitter successfully', async () => {
      const connectionData: CreateTwitterConnDto = { auth_code: 'drmsqd13421_134mfkerje',
         redirect_uri: 'socialitics.fyi/auth/callback' };
      mockTwitterConnService.connect.mockResolvedValue(connectionData);

      const result = await twitterConnController.create(connectionData, request);
      expect(result).toEqual(connectionData);
      expect(twitterConnService.create).toHaveBeenCalledWith(connectionData);
    });

    it('should throw an exception if connection fails', async () => {
      const connectionData: CreateTwitterConnDto = { auth_code: 'drmsqd13421_134mfkerje',
         redirect_uri: 'socialitics.fyi/auth/callbakc' };
      mockTwitterConnService.connect.mockRejectedValue(new HttpException(
        'wrong auth code or redirect uri', 500));

      await expect(twitterConnController.create(connectionData, 
        request)).rejects.toThrow(HttpException);
      expect(twitterConnService.create).toHaveBeenCalledWith(connectionData);
    });
  });
});