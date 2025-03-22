import { Column, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    
    @PrimaryColumn()
    firebaseUID: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    bio: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    TwitterUserName: string;

    @Column({ nullable: true })
    FaceBookUserName: string;

    @Column({ nullable: true })
    InstagramUserName: string;
}
