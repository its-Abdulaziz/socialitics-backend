import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { HttpException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    checkExist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
        const userDto: CreateUserDto = { name: 'Smash Burger',
             firebaseUID: 'VpJOUX05QSh86FNf44Gb4jGYEF02',
            email: 'john@example.com', image: 'image.png', bio: 'Burger Restaurant' };
        mockUserService.create.mockResolvedValue(userDto);

      const result = await userController.create(userDto);
      expect(result).toEqual(userDto);
      expect(userService.create).toHaveBeenCalledWith(userDto);
    });

    it('should throw an exception if user creation fails', async () => {
      const userDto: CreateUserDto = { name: 'Crave Burger',
         firebaseUID: 'WxJDWINJEFN98DSNJDSJN3NJNF03',
         email: 'john@example.com', image: 'image.png', bio: 'Burger Restaurant' };
      mockUserService.create.mockRejectedValue(new HttpException('Error', 500));

      await expect(userController.create(userDto)).rejects.toThrow(HttpException);
      expect(userService.create).toHaveBeenCalledWith(userDto);
    });
  });

  describe('checkExist', () => {
    it('should return true if user exists', async () => {
      const firebaseUID: GetUserDto = { firebaseUID: 'VpJOUX05QSh86FNf44Gb4jGYEF02' };
      mockUserService.checkExist.mockResolvedValue(true);

      const result = await userController.checkExist(firebaseUID);
      expect(result).toBe(true);
      expect(userService.checkExist).toHaveBeenCalledWith(firebaseUID.firebaseUID);
    });

    it('should return false if user does not exist', async () => {
      const firebaseUID: GetUserDto = { firebaseUID: 'WxJDWINJEFN98DSNJDSJN3NJNF03' };
      mockUserService.checkExist.mockResolvedValue(false);

      const result = await userController.checkExist(firebaseUID);
      expect(result).toBe(false);
      expect(userService.checkExist).toHaveBeenCalledWith(firebaseUID.firebaseUID);
    });
  });
});