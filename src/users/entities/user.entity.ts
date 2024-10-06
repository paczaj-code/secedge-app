import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { Site } from './site.entity';
import { uuidv7 } from 'uuidv7';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  uuid: string = uuidv7();

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

  @ManyToOne(() => UserRole, (role) => role.id)
  role: UserRole;

  @ManyToOne(() => Site, (site) => site.id)
  default_site: Site;

  @Column({ default: true })
  is_active: boolean;

  @ManyToMany(() => Site)
  @JoinTable()
  other_sites: Site[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  public creator?: number;
}
