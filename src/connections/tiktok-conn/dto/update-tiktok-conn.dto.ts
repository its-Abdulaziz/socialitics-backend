import { PartialType } from '@nestjs/mapped-types';
import { CreateTiktokConnDto } from './create-tiktok-conn.dto';

export class UpdateTiktokConnDto extends PartialType(CreateTiktokConnDto) {}
