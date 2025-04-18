import { Injectable } from '@nestjs/common';

@Injectable()
export class InstagramSchedulerService {
  create(createInstagramSchedulerDto: any) {
    return 'This action adds a new instagramScheduler';
  }

  findAll() {
    return `This action returns all instagramScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instagramScheduler`;
  }

  update(id: number, updateInstagramSchedulerDto: any) {
    return `This action updates a #${id} instagramScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} instagramScheduler`;
  }
}
