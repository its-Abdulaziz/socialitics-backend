import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TwitterConnService } from './twitter-conn.service';
import { CreateTwitterConnDto } from './dto/create-twitter-conn.dto';
import { UpdateTwitterConnDto } from './dto/update-twitter-conn.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';

@UseGuards(FirebaseAuthGuard)
@Controller('api/connections/twitter')

export class TwitterConnController {
  constructor(private readonly twitterConnService: TwitterConnService) {}

  @Post()
  create(@Body() data: CreateTwitterConnDto, @Request() req, 
) {
    return this.twitterConnService.create(data, req);
  }


  @Get(':firebaseUID')
  findOne(@Query('firebaseUID') firebaseUID: string) {
    return this.twitterConnService.findOne(firebaseUID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTwitterConnDto: UpdateTwitterConnDto) {
    return this.twitterConnService.update(+id, updateTwitterConnDto);
  }

  @Delete('delete')
  remove(@Body() body: any, @Request() req) {
    return this.twitterConnService.remove(body.firebaseUID, req);
  }

  @NoAuth()
  @Post('refreshToken')
  refreshToken(@Body() data: any) {
    return this.twitterConnService.refreshToken(data);
  }
}
