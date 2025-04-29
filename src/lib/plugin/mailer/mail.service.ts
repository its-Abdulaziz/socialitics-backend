import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
      ) {}


      async sendEmail(to: string, subject: string, template: string, data: any) {
        await this.mailerService.sendMail({
          to: to,
          subject: subject,
          template: template, // `.hbs` extension is appended automatically
          context: { ...data },
        });
        console.log('email sent')
      }

      async sendSuccessEmail(firebaseUID: string, fileURl: string): Promise<any> {
        
        const user = await this.userRepo.findOne({ where: { firebaseUID: firebaseUID } });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        try {
        await this.sendEmail(user.email, 'Monthly report from Socialitics is ready!', './report', {
          name: user.name,
          createdAt: new Date(),
          fireUrl: fileURl,
        });
        } catch (error) {
          throw new HttpException(error.message, error.status);
        }
        return { message: 'Email sent' };
      }
}
