import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { uuidv7 } from 'uuidv7';

@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  uuid: string = uuidv7();

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  description: string;
}
