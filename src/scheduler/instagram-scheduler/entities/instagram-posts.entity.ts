import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class InstagramPosts {
    @PrimaryColumn()
    firebaseUID: string;

    @PrimaryColumn()
    postID: string;

    @Column()
    instagramID: string;

    @Column()
    userName: string;

    @Column()
    mediaType: string;

    @Column({nullable: true})
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
    reach: number;

    @Column()
    totalInteractions: number;

    @Column()
    shortcode: string;
}
