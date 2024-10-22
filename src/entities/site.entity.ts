import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    generated: 'uuid',
  })
  uuid: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  description: string;
}
