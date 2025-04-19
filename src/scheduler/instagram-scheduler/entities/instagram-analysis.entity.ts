
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class InstagramAnalysis {

    @PrimaryColumn()
    firebaseUID: string;

    @PrimaryColumn()
    weekNumber: number;

    @Column()
    instagramID: string;

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
    commentsCount: number;

    @Column()
    sharesCount: number;

    @Column()
    viewsCount: number;

    @Column()
    reachCount: number;

    @Column()
    totalInteractions: number;

    @Column({ type: 'double precision' })
    engagementRate: number;

    @Column({nullable: true})
    topPostID: string;

}