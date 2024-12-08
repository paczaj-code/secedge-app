import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Site } from './site.entity';
import { UserRoles } from '../enums/userRoles';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: false })
  hashed_password: string;

  @Column({ default: true })
  is_init_password: boolean;

  @Column({ default: 'OFFICER' })
  role: UserRoles;

  @ManyToOne(() => Site, (site) => site.id, {
    nullable: false,
  })
  default_site: Site;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  public creator?: number;
  //   TODO change to obligatory

  @ManyToMany(() => Site, (site) => site.users_other_sites, {
    cascade: true,
  })
  @JoinTable()
  public other_sites?: Site[];
}
