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

    @Column({ nullable: true })
    createdAt: Date;
}
