import { Column, PrimaryColumn } from "typeorm";

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
access_token: string

@Column()
refresh_token: string

@Column()
validUntil: Date

@Column()
scope: string

}
