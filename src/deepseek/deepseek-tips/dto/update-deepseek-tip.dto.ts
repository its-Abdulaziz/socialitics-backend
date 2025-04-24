import { PartialType } from '@nestjs/mapped-types';
import { CreateDeepseekTipDto } from './create-deepseek-tip.dto';

export class UpdateDeepseekTipDto extends PartialType(CreateDeepseekTipDto) {}
