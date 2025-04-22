import { PartialType } from '@nestjs/mapped-types';
import { CreatePostsSchedulerDto } from './create-posts-scheduler.dto';

export class UpdatePostsSchedulerDto extends PartialType(CreatePostsSchedulerDto) {}
