import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Reports {

    @PrimaryColumn()
    firebaseUID: string;

    @PrimaryColumn({ type: 'date' })
    month: Date;

    @Column()
    fileUrl: string;

    @Column()
    generatedAt: Date;
}
