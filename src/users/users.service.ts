import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { QueryHelper } from '../generic/query-helper/query-helper';

@Injectable()
export class UsersService {
  selectedColumns = [
    'user.id',
    'user.uuid',
    'user.first_name',
    'user.last_name',
    'user.email',
    'user.phone',
    'user.default_site',
    'site.name',
    'site.uuid',
    'other_sites.name',
    'other_sites.uuid',
    'user.created_at',
    'user.updated_at',
  ];

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    // @InjectRepository(Site) private readonly siteRepository: Repository<Site>,
    // private readonly baseDatabaseService: BaseDatabaseService<typeof User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(
    page: number,
    perPage: number,
    orderBy: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC',
    filters: { [key: string]: string } = {},
  ): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(this.selectedColumns)
      .orderBy(`user.${orderBy}`, order);

    const queryHelper = new QueryHelper<User>(queryBuilder)
      .applyPagination({ page, perPage })
      .applyFilters(filters, 'user');
    return queryHelper.getQueryBuilder().getMany();
  }

  async findOne(uuid: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid: uuid })
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(this.selectedColumns)
      .getOne();
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findUserByEmail(email: string): Promise<User> {
    const user = this.userRepository.findOne({ where: { email: email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
}
