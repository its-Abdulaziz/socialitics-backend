import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TiktokConn {

@PrimaryColumn()
firebaseUID: string;

@Column()
tiktokID: string;

@Column()
userName: string;

@Column()
accessToken: string

@Column()
refreshToken: string

@Column()
validUntil: Date

@Column()
refreshValidUntil: Date

@Column()
scope: string

@Column({ nullable: true })
createdAt: Date

}

