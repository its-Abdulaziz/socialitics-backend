import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Admin {

    @PrimaryColumn()
    username: string;

    @Column()
    password: string;

    @Column()
    role: string;

}