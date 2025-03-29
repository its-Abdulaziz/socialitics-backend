import { Column, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class FacebookConn {

    @PrimaryColumn()
    firebaseUID: string;
    
    @Column()
    facebookID: string;
    
    @Column()
    name: string;

    @Column()
    accessToken: string;

    @Column()
    validUntil: Date;

    @Column()
    pageName: string;

    @Column()
    pageAccessToken: string;

    @Column()
    pageID: string;

    @Column({ nullable: true })
    createdAt: Date;
}
