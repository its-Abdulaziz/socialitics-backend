import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, Req, UseGuards } from '@nestjs/common';
import { InstagramConnService } from './instagram-conn.service';
import { CreateInstagramConnDto } from './dto/create-instagram-conn.dto';
import { UpdateInstagramConnDto } from './dto/update-instagram-conn.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('api/connections/instagram')
export class InstagramConnController {
  constructor(private readonly instagramConnService: InstagramConnService) {}

  @Post()
  create(@Body() createInstagramConnDto: CreateInstagramConnDto, @Req() req: Request) {
    return this.instagramConnService.create(createInstagramConnDto, req);
  }

  @Get()
  findAll() {
    return this.instagramConnService.findAll();
  }

  @Get(':firebaseUID')
  findOne(@Param('firebaseUID') firebaseUID: string) {
    return this.instagramConnService.findOne(firebaseUID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstagramConnDto: UpdateInstagramConnDto) {
    return this.instagramConnService.update(+id, updateInstagramConnDto);
  }

  @Delete(':firebaseUID')
  remove(@Query('firebaseUID') firebaseUID: string, @Request() req) {
    return this.instagramConnService.remove(firebaseUID, req);
  }
}
