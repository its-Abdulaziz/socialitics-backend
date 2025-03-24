import { PartialType } from '@nestjs/mapped-types';
import { CreateInstagramConnDto } from './create-instagram-conn.dto';

export class UpdateInstagramConnDto extends PartialType(CreateInstagramConnDto) {}
