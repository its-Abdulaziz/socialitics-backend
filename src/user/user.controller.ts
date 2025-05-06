import { Controller, Get, Post, Query, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { query } from 'express';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { AdminGuard } from 'src/lib/guard/admin.guard';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @UseGuards(AdminGuard)
  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('/details')
  findOne(@Query() query: GetUserDto) {
    return this.userService.findOne(query.firebaseUID);
  }

  @Get()
  async checkExist(@Query() query: GetUserDto) {
    const userExist = await this.userService.checkExist(query.firebaseUID);
    return userExist;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':firebaseUID')
  remove(@Query('firebaseUID') firebaseUID: string, @Request() req) {
    return this.userService.remove(firebaseUID, req);
  }

  @Post('/admin/login')
  adminLogin(@Body() body: any) {
    return this.userService.adminLogin(body);
  }

  @Post('/suspend')
  @UseGuards(AdminGuard)
  suspendUser(@Body() body: any) {
    return this.userService.suspendUser(body.firebaseUID);
  }
}
