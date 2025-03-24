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
    return 'hello v1';
  }
}
