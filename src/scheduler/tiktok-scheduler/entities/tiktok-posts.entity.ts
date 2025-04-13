import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TiktokPosts {

    @PrimaryColumn()
    postId: string;
    
    @PrimaryColumn()
    firebaseUID: string;
    
    @Column()
    tiktokID: string;
    
    @Column({nullable: true})
    userName: string;
    
    @Column()
    content: string;
    
    @Column()
    createdAt: Date;
    
    @Column()
    likes: number; 
    
    @Column()
    comments: number;
    
    @Column()
    shares: number;

    @Column()
    views: number;

    @Column()
    embedUrl: string;
    
}
