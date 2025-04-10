import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor( private readonly dataSource: DataSource) {}

  @Get('health')
  async checkHealth() {
    try {
      await this.dataSource.query('SELECT 1');
      return { 
        status: 'ok',
        database: 'connected'
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'connection failed',
        error: error.message
      };
    }
  }
  @Get()
  hello() {
    return 'ًWelcome to Socialitics Backend. v1';
  }

  @Get('time')
  hello1() {
    let lastEndDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    lastEndDate.setMinutes(lastEndDate.getMinutes() + 2);
    lastEndDate.setMilliseconds(0)
    const start_time = lastEndDate.toISOString();
    console.log(start_time)
    return start_time;
  }
}
