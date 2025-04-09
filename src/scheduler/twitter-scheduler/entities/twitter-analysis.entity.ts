import { Column, Entity, PrimaryColumn,  } from "typeorm";

@Entity()
export class TwitterAnalysis {

    @PrimaryColumn()
    firebaseUID: string;

    @PrimaryColumn()
    weekNumber: number;

    @Column()
    twitterId: string;

    @Column()
    userName: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;  

    @Column()
    tweetsCount: number;

    @Column()
    followersCount: number;

    @Column()
    likesCount: number;

    @Column()
    retweetsCount: number;

    @Column()
    repliesCount: number;

    @Column()
    impressionsCount: number;

    @Column()
    engagementRate: number;

}