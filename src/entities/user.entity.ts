import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  Index,
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

  @Column({ nullable: false, select: false })
  hashed_password: string;

  @Column({ default: true })
  is_init_password: boolean;

  @Column({ default: 'USER' })
  role: UserRoles;

  @ManyToOne(() => Site, (site) => site.id, {
    nullable: false,
  })
  default_site: Site;

  @Column({ default: true })
  is_active: boolean;

  @Column('text', { array: true, default: '{}' })
  other_sites: number[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  public creator?: number;
  //   TODO change to obligatory

  public aa?: string[];

  // @AfterLoad()
  // public setAa() {
  //   this.aa = this.uuid;
  // }
}
