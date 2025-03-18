import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TwitterConnService } from './twitter-conn.service';
import { CreateTwitterConnDto } from './dto/create-twitter-conn.dto';
import { UpdateTwitterConnDto } from './dto/update-twitter-conn.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('api/connections/twitter')

export class TwitterConnController {
  constructor(private readonly twitterConnService: TwitterConnService) {}

  @Post()
  create(@Body() data: CreateTwitterConnDto, @Request() req, 
) {
    return this.twitterConnService.create(data, req);
  }

  @Get()
  findAll() {
    return this.twitterConnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') firebaseUID: string) {
    return this.twitterConnService.findOne(firebaseUID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTwitterConnDto: UpdateTwitterConnDto) {
    return this.twitterConnService.update(+id, updateTwitterConnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.twitterConnService.remove(+id);
  }
}
