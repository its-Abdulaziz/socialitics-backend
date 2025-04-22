
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('posts_scheduler')
export class PostsScheduler {

    @PrimaryGeneratedColumn('uuid')
    postID: number;

    @PrimaryColumn()
    firebaseUID: string;

    @Column()
    scheduleDate: Date;

    @Column()
    status: string;

    @Column()
    platform: string;

    @Column({nullable: true})
    content: string;

    @Column({nullable: true})
    mediaUrl: string;

    @Column({nullable: true})
    mediaType: string
   


}
