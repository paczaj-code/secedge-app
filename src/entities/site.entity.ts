import {
  Column,
  Entity,
  Generated,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Represents a Site entity with properties such as id, uuid, name, address, and description.
 * This class is mapped to the 'sites' table in the database.
 */
@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToMany(() => User, (user) => user.other_sites)
  public users_other_sites?: User[];
}
