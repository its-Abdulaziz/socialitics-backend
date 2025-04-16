import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class FacebookPosts {

    @PrimaryColumn()
    firebaseUID: string;

    @PrimaryColumn()
    postID: string;

    @Column()
    pageID: string;

    @Column({nullable: true})
    userName: string;
    
    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column()
    likes: number;

    @Column()
    love: number;

    @Column()
    shares: number;

    @Column()
    haha: number;

    @Column()
    comments: number;

    @Column()
    permalinkUrl: string;
}
