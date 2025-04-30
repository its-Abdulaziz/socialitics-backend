import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReportSchedulerDto } from './dto/create-report-scheduler.dto';
import { UpdateReportSchedulerDto } from './dto/update-report-scheduler.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reports } from './entities/reports.entity';
import { LessThan, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { FacebookAnalysis } from '../facebook-scheduler/entities/facebook-analysis.entity';
import { TwitterAnalysis } from '../twitter-scheduler/entities/twitter-analysis.entity';
import { TiktokAnalysis } from '../tiktok-scheduler/entities/tiktok-analysis.entity';
import { InstagramAnalysis } from '../instagram-scheduler/entities/instagram-analysis.entity';
import { User } from 'src/user/entities/user.entity';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as ExcelJS from 'exceljs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MailService } from 'src/lib/plugin/mailer/mail.service';
import { Cron } from '@nestjs/schedule';

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


  @Cron('0 1 1 * *')
  async create(firebaseUID: string) {

    firebaseUID = 'VpJOUX05QSh86FNf44Gb4jGYEF02'
    try {
    
    const user = await this.userRepo.findOne({ where: { firebaseUID } });

    if(!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const now = new Date();

    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const twitterData = await this.twitterAnalysisRepo.find(
      { 
        where: { firebaseUID: firebaseUID,
                 startDate: MoreThanOrEqual(firstDayOfLastMonth),
                 endDate: LessThan(firstDayOfThisMonth)
               } 
      });

      const tiktokData = await this.tiktokAnalysisRepo.find(
        { 
          where: { firebaseUID: firebaseUID,
                   startDate: MoreThanOrEqual(firstDayOfLastMonth),
                   endDate: LessThan(firstDayOfThisMonth)
                 } 
        });

      const instagramData = await this.instagramAnalysisRepo.find(
        { 
          where: { firebaseUID: firebaseUID,
                   startDate: MoreThanOrEqual(firstDayOfLastMonth),
                   endDate: LessThan(firstDayOfThisMonth)
                 } 
        });

        const facebookData = await this.facebookAnalysisRepo.find(
          { 
            where: { firebaseUID: firebaseUID,
                     startDate: MoreThanOrEqual(firstDayOfLastMonth),
                     endDate: LessThan(firstDayOfThisMonth)
                   } 
          });


    const xlsxBuffer = await this.generateExcelFile(twitterData, facebookData, tiktokData, instagramData)
    
    const fileName = `${Date.now()}.xlsx`;

    const save = await this.uploadToR2(fileName, xlsxBuffer)

    console.log(`report ${fileName} uploaded to R2`)

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `report/${fileName}`,
      ResponseContentDisposition: 'attachment; filename="report-file.xlsx"',
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 604000 });

    await this.mailService.sendSuccessEmail(firebaseUID, url)

    console.log(`report ${fileName} sent to ${user.email}`)

    await this.reportSchedulerRepo.save(
      { 
        firebaseUID: firebaseUID, 
        month: new Date(now.getFullYear(), now.getMonth(), 1), 
        fileUrl: `report/${fileName}`,
        generatedAt: new Date()
      }
    )

    console.log(`report ${fileName} saved`)

     } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  private async generateExcelFile(twitterData: any, facebookData: any, tiktokData: any, instagramData: any){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Report');

    worksheet.addRow(['Twitter Data']);
    worksheet.addRow([])

    worksheet.addRow(['Week Number', '# Of Tweets', '# Of Followers','# Of Likes', '# Of Retweets', '# Of Replies', '# Of Impressions', 'Engagement Rate']);
    twitterData.forEach((week) => {
      worksheet.addRow([week.weekNumber, week.tweetsCount, week.followersCount, week.likesCount, week.retweetsCount, week.repliesCount, week.impressionsCount, week.engagementRate]);
    })

    worksheet.addRow([])

    
    worksheet.addRow(['Facebook Data']);
    worksheet.addRow([])

    worksheet.addRow(['Week Number', '# Of Posts', '# Of Followers','# Of Likes', '# Of `Loves`', '# Of Hahas', '# Of Shares', '# Of Comments', 'Engagement Rate']);
    facebookData.forEach((week) => {
      worksheet.addRow([week.weekNumber, week.postsCount, week.followersCount, week.likesCount, week.loveCount, week.hahaCount, week.sharesCount, week.commentsCount, week.engagementRate]);
    })

    worksheet.addRow([])

    
    worksheet.addRow(['TikTok Data']);
    worksheet.addRow([])

    worksheet.addRow(['Week Number', '# Of Posts', '# Of Followers','# Of Likes', '# Of Comments', '# Of Shares', '# Of Views', 'Engagement Rate']);
    tiktokData.forEach((week) => {
      worksheet.addRow([week.weekNumber, week.postsCount, week.followersCount, week.likesCount, week.commentsCount, week.sharesCount, week.viewsCount, week.engagementRate]);
    })

    worksheet.addRow([])

    worksheet.addRow(['Instagram Data']);
    worksheet.addRow([])

    worksheet.addRow(['Week Number', '# Of Posts', '# Of Followers','# Of Likes', '# Of Comments', '# Of Shares', '# Of Views', '# of Reach','# of Interactions', 'Engagement Rate']);
    instagramData.forEach((week) => {
      worksheet.addRow([week.weekNumber, week.postsCount, week.followersCount, week.likesCount, week.commentsCount, week.sharesCount, week.viewsCount, week.reachesCount, week.totalInteractions, week.engagementRate]);
    })
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
