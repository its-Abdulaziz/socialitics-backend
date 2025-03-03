import { Column, PrimaryColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    
    @PrimaryColumn()
    firebaseUID: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
