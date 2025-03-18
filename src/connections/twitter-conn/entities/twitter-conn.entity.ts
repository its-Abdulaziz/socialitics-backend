import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TwitterConn {

@PrimaryColumn()
firebaseUID: string;

@Column()
userName: string;

@Column()
twitterID: string;

@Column()
name: string

@Column()
image: string

@Column()
accessToken: string

@Column()
refreshToken: string

@Column()
validUntil: Date

@Column()
scope: string

}
