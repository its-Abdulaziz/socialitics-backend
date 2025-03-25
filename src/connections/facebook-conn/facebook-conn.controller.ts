import { Controller, Get, Request, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FacebookConnService } from './facebook-conn.service';
import { CreateFacebookConnDto } from './dto/create-facebook-conn.dto';
import { UpdateFacebookConnDto } from './dto/update-facebook-conn.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('api/connections/facebook')
export class FacebookConnController {
  constructor(private readonly facebookConnService: FacebookConnService) {}

  @Post()
  create(@Body() createFacebookConnDto: CreateFacebookConnDto, @Request() req) {
    return this.facebookConnService.create(createFacebookConnDto, req);
  }

  @Get()
  findAll() {
    return this.facebookConnService.findAll();
  }

  @Get(':firebaseUID')
  findOne(@Param('firebaseUID') firebaseUID: string) {
    return this.facebookConnService.findOne(firebaseUID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacebookConnDto: UpdateFacebookConnDto) {
    return this.facebookConnService.update(+id, updateFacebookConnDto);
  }

  @Delete(':firebaseUID')
  remove(@Param('firebaseUID') firebaseUID: string, @Request() req) {
    return this.facebookConnService.remove(firebaseUID, req);
  }
}
