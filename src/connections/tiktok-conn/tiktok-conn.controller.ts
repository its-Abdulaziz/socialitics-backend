import { Controller, Get, Post, Body, Request, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TiktokConnService } from './tiktok-conn.service';
import { CreateTiktokConnDto } from './dto/create-tiktok-conn.dto';
import { UpdateTiktokConnDto } from './dto/update-tiktok-conn.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';


@UseGuards(FirebaseAuthGuard)
@Controller('api/connections/tiktok')
export class TiktokConnController {
  constructor(private readonly tiktokConnService: TiktokConnService) {}

  @Post()
  create(@Body() createTiktokConnDto: CreateTiktokConnDto, @Request() req) {
    return this.tiktokConnService.create(createTiktokConnDto, req);
  }

  @Get()
  findAll() {
    return this.tiktokConnService.findAll();
  }

  @Get(':firebaseUID')
  findOne(@Param('firebaseUID') firebaseUID: string) {
    return this.tiktokConnService.findOne(firebaseUID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTiktokConnDto: UpdateTiktokConnDto) {
    return this.tiktokConnService.update(+id, updateTiktokConnDto);
  }

  @Delete(':firebaseUID')
  remove(@Param('firebaseUID') firebaseUID: string, @Request() req) {
    return this.tiktokConnService.remove(firebaseUID, req);
  }
}
