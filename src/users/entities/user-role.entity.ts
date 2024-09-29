import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { uuidv7 } from 'uuidv7';

export enum UserRoles {
  VIEWER = 0,
  USER = 1,
  SHIFT_SUPERVISOR = 2,
  TEAM_LEADER = 3,
  MANAGER = 4,
  SUPER_ADMIN = 9,
}

@Entity({ name: 'user_roles' })
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  uuid: string = uuidv7();

  @Column('text', { nullable: false, unique: true })
  role:
    | 'USER'
    | 'VIEWER'
    | 'SHIFT_SUPERVISOR'
    | 'TEAM_LEADER'
    | 'MANAGER'
    | 'SUPER_ADMIN';

  @Column({ nullable: true, type: 'text' })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
