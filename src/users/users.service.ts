import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';
import { Site } from '../entities/site.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Site) private readonly siteRepository: Repository<Site>,
    private readonly baseDatabaseService: BaseDatabaseService<typeof User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .select([
        'user.id',
        'user.uuid',
        'user.first_name',
        'user.last_name',
        'user.default_site',
        'site.name',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "JSON_AGG(json_build_object('name',site.name, 'uuid',site.uuid))",
          )
          .from(Site, 'site')
          .where(
            'site.id = ANY(ARRAY(SELECT unnest(user.other_sites)::integer))',
          );
      }, 'aa')
      .orderBy('user.id')
      .getRawMany();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .select([
        'user.id',
        'user.uuid',
        'user.first_name',
        'user.last_name',
        'user.default_site',
        'site.name',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "JSON_AGG(json_build_object('name',site.name, 'uuid',site.uuid))",
          )
          .from(Site, 'site')
          .where(
            'site.id = ANY(ARRAY(SELECT unnest(user.other_sites)::integer))',
          );
      }, 'aa')
      .where('user.id = :id', { id: id })
      .getRawOne();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
