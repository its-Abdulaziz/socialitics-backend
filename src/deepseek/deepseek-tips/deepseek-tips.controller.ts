import { Controller, Get, Post, Request, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { DeepseekTipsService } from './deepseek-tips.service';
import { CreateDeepseekTipDto } from './dto/create-deepseek-tip.dto';
import { UpdateDeepseekTipDto } from './dto/update-deepseek-tip.dto';
import { FirebaseAuthGuard } from 'src/lib/guard/firebaseAuth.guard';
import { NoAuth } from 'src/lib/decorators/no-auth.decorator';


@UseGuards(FirebaseAuthGuard)
@Controller('deepseekTips')
export class DeepseekTipsController {
  constructor(private readonly deepseekTipsService: DeepseekTipsService) {}

  @NoAuth()
  @Post('generate/tiktok')
  generateTiktok(@Query() body: any) {
    return this.deepseekTipsService.addTiktokTips(body.firebaseUID);
  }

  @NoAuth()
  @Post('generate/instagram')
  generateInstagram(@Query() body: any) {
    return this.deepseekTipsService.addInstagramTips(body.firebaseUID);
  }

  @Get('tiktok/tips')
  getTiktokTips(@Query() body: any, @Request() req: any) {
    if(body.firebaseUID != req.currentUser.firebaseUID){
      throw new HttpException(
        `You can can get only your own data!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.deepseekTipsService.getTikTokTips(body.firebaseUID);
  }

  @Get('instagram/tips')
  getInstagramTips(@Query() body: any, @Request() req: any) {
    if(body.firebaseUID != req.currentUser.firebaseUID){
      throw new HttpException(
        `You can can get only your own data!`,
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.deepseekTipsService.getInstagramTips(body.firebaseUID);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deepseekTipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeepseekTipDto: UpdateDeepseekTipDto) {
    return this.deepseekTipsService.update(+id, updateDeepseekTipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deepseekTipsService.remove(+id);
  }
}
