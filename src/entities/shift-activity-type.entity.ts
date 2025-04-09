import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShiftActivity } from './shift-activity.entity';
import { User } from './user.entity';
import { IsString } from 'class-validator';

@Entity()
export class ShiftActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @IsString()
  @Column({ nullable: false })
  name: string;

  @IsString()
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  public created_by?: User;

  @OneToMany(() => ShiftActivity, (shiftActivity) => shiftActivity.type)
  activities: ShiftActivity[];
}
