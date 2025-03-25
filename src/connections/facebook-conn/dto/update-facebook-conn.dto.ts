import { PartialType } from '@nestjs/mapped-types';
import { CreateFacebookConnDto } from './create-facebook-conn.dto';

export class UpdateFacebookConnDto extends PartialType(CreateFacebookConnDto) {}
