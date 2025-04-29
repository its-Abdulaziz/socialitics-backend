import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReportSchedulerDto } from './dto/create-report-scheduler.dto';
import { UpdateReportSchedulerDto } from './dto/update-report-scheduler.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports } from './entities/reports.entity';
import { Repository } from 'typeorm';
import { FacebookAnalysis } from '../facebook-scheduler/entities/facebook-analysis.entity';
import { TwitterAnalysis } from '../twitter-scheduler/entities/twitter-analysis.entity';
import { TiktokAnalysis } from '../tiktok-scheduler/entities/tiktok-analysis.entity';
import { InstagramAnalysis } from '../instagram-scheduler/entities/instagram-analysis.entity';
import { User } from 'src/user/entities/user.entity';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as ExcelJS from 'exceljs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MailService } from 'src/lib/plugin/mailer/mail.service';

@Injectable()
export class ReportSchedulerService {

  private readonly s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY,
    },
  });
  
  constructor(
    @InjectRepository(Reports) private readonly reportSchedulerRepo: Repository<Reports>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(FacebookAnalysis) private readonly facebookAnalysisRepo: Repository<FacebookAnalysis>,
    @InjectRepository(TwitterAnalysis) private readonly twitterAnalysisRepo: Repository<TwitterAnalysis>,
    @InjectRepository(TiktokAnalysis) private readonly tiktokAnalysisRepo: Repository<TiktokAnalysis>,
    @InjectRepository(InstagramAnalysis) private readonly instagramAnalysisRepo: Repository<InstagramAnalysis>,

    private readonly mailService: MailService
  ){}
  async create(firebaseUID: string) {

    
    const user = await this.userRepo.findOne({ where: { firebaseUID } });

    if(!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }


const data = {
  userId: "111111",
  month: new Date().toISOString().split('T')[0],
  metrics: {
    sales: 1500,
    expenses: 750,
    profit: 750,
    },
    transactions: [
      { id: 1, amount: 100 },
      { id: 2, amount: 200 },
      ],
    };

   // const xlsxBuffer = await this.generateExcelFile(data)

    
    const fileName = `1745882989343.xlsx`;

  //  const save = await this.uploadToR2(fileName, xlsxBuffer)


    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `report/${fileName}`,
      ResponseContentDisposition: 'attachment; filename="your-file.xlsx"',
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    



    await this.mailService.sendSuccessEmail(firebaseUID, url)
  }

  private async generateExcelFile(data: any){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Report');

    // Add headers
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
    ];

    // Add metrics
    worksheet.addRow({ metric: 'Total Sales', value: data.metrics.sales });
    worksheet.addRow({ metric: 'Total Expenses', value: data.metrics.expenses });
    worksheet.addRow({ metric: 'Net Profit', value: data.metrics.profit });

    // Add transactions section
    worksheet.addRow([]); // Empty row
    worksheet.addRow(['Transaction ID', 'Amount']);

    data.transactions.forEach(transaction => {
      worksheet.addRow([transaction.id, transaction.amount]);
    });

    // Generate buffer
    return await workbook.xlsx.writeBuffer();
  }

  private async uploadToR2(key: string, buffer: any) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `report/${key}`,
      Body: buffer,
      ContentType: 'text/xlsx',
    });

    const send =  await this.s3Client.send(command);
    console.log(send)
  }

  findAll() {
    return `This action returns all reportScheduler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportScheduler`;
  }

  update(id: number, updateReportSchedulerDto: UpdateReportSchedulerDto) {
    return `This action updates a #${id} reportScheduler`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportScheduler`;
  }
}
