import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DeepseekTipsService } from './deepseek-tips.service';
import { CreateDeepseekTipDto } from './dto/create-deepseek-tip.dto';
import { UpdateDeepseekTipDto } from './dto/update-deepseek-tip.dto';

@Controller('deepseekTips')
export class DeepseekTipsController {
  constructor(private readonly deepseekTipsService: DeepseekTipsService) {}

  @Post('generate/tiktok')
  generateTiktok(@Query() body: any) {
    return this.deepseekTipsService.addTiktokTips(body.firebaseUID);
  }
  @Post()
  create(@Body() createDeepseekTipDto: CreateDeepseekTipDto) {
    return this.deepseekTipsService.create(createDeepseekTipDto);
  }

  @Get('tiktok/tips')
  getTiktokTips(@Query() body: any) {
    return this.deepseekTipsService.getTikTokTips(body.firebaseUID);
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
