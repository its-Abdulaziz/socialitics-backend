
import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity()
export class performanceTips {

    @PrimaryColumn()
    firebaseUID: string

    @PrimaryColumn()
    weekNumber: number

    @PrimaryColumn()
    platform: string

    @Column('text', { array: true })
    tips: string[]

}
