import { Column, Entity, PrimaryColumn,  } from "typeorm";

@Entity()
export class Tweets {

@PrimaryColumn()
tweetId: string;

@PrimaryColumn()
firebaseUID: string;

@Column()
twitterUID: string;

@Column()
content: string;

@Column()
createdAt: Date;

@Column()
likes: number; 

@Column()
replies: number;

@Column()
retweets: number;

@Column()
engagement: number;

@Column()
impressions: number;

}
