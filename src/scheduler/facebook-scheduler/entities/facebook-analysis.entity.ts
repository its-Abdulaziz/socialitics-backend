
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class FacebookAnalysis {

    @PrimaryColumn()
    firebaseUID: string;
    
    @PrimaryColumn()
    weekNumber: number;

    @Column()
    pageID: string;

    @Column()
    userName: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    postsCount: number;

    @Column()
    followersCount: number;

    @Column()
    likesCount: number;

    @Column()
    loveCount: number;

    @Column()
    sharesCount: number;

    @Column()
    hahaCount: number;

    @Column()
    commentsCount: number;

    @Column({ type: 'double precision' })
    engagementRate: number;

    @Column({nullable: true})
    topPostID: string;

}
