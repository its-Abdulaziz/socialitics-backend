import { Column, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class InstagramConn {
    @PrimaryColumn()
    firebaseUID: string;
    
    @Column()
    instagramID: string;
    
    @Column()
    userName: string;

    @Column()
    accessToken: string;

    @Column()
    validUntil: Date;

    @Column()
    permissions: string;

    @Column({ nullable: true })
    createdAt: Date;
}
