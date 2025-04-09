import { Controller, Get, Post, Query, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { query } from 'express';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post()
  @NoAuth()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('/details')
  @NoAuth()
  findOne(@Query() query: GetUserDto) {
    return this.userService.findOne(query.firebaseUID);
  }

  @Get()
  @NoAuth()
  async checkExist(@Query() query: GetUserDto) {
    const userExist = await this.userService.checkExist(query.firebaseUID);
    return {isExist: userExist};
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':firebaseUID')
  remove(@Query('firebaseUID') firebaseUID: string, @Request() req) {
    return this.userService.remove(firebaseUID, req);
  }
}
