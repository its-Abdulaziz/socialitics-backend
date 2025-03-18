import { PartialType } from '@nestjs/mapped-types';
import { CreateTwitterConnDto } from './create-twitter-conn.dto';

export class UpdateTwitterConnDto extends PartialType(CreateTwitterConnDto) {}
