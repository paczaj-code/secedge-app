import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { QueryHelper } from '../generic/query-helper/query-helper';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

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
    'site.id',
    'user.role',
    'site.uuid',
    'other_sites.name',
    'other_sites.id',
    'other_sites.uuid',
    'user.created_at',
    'user.updated_at',
  ];

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
  ): Promise<{
    items: User[];
    totalItems: number;
    itemCount: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(this.selectedColumns)
      .orderBy(`user.${orderBy}`, order);

    // return paginate(queryBuilder, o);
    const queryHelper = new QueryHelper<User>(queryBuilder)
      .applyPagination({ page, perPage })
      .applyFilters(filters, 'user');

    // const result = queryHelper.getQueryBuilder()
    const [items, total] = await queryHelper
      .getQueryBuilder()
      .getManyAndCount();
    return {
      items,
      totalItems: total,
      itemCount: items.length,
      currentPage: page,
      itemsPerPage: perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async paginatedAllUsers(
    options: IPaginationOptions,
  ): Promise<Pagination<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(this.selectedColumns)
      .orderBy('user.id');
    return paginate<User>(queryBuilder, options);
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
    const selected = [
      'user.id',
      'user.uuid',
      'user.first_name',
      'user.last_name',
      'user.email',
      'user.phone',
      'user.hashed_password',
      'user.role',
      'user.default_site',
      'site.name',
      'site.uuid',
      'site.id',
      'other_sites.name',
      'other_sites.uuid',
      'other_sites.id',
    ];

    const user = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email })
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(selected)
      .getOne();
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async demLoginUsers() {
    return await this.userRepository.query(`
        WITH users_data AS (
            SELECT users.id,
                   users.uuid,
                   users.first_name,
                   users.last_name,
                   users.email,
                   users.phone,
                   users.role,
                   s.name AS default_site,
                   (SELECT count(*)
                    FROM users_other_sites_sites
                    WHERE "usersId" = users.id) AS sites_count,
                   (SELECT json_agg(s_sub.name)
                    FROM users_other_sites_sites
                             JOIN public.sites s_sub
                                  ON s_sub.id = users_other_sites_sites."sitesId"
                    WHERE "usersId" = users.id) AS other_sites
            FROM users
                     JOIN public.sites s
                          ON s.id = users."defaultSiteId"
        )

        SELECT * FROM users_data WHERE role='TEAM_LEADER'
        UNION ALL
        (SELECT * FROM users_data WHERE role='SHIFT_SUPERVISOR' LIMIT 3)
        UNION ALL
        (SELECT * FROM users_data WHERE sites_count=0 AND users_data.default_site='WAW01' LIMIT 1)
        UNION ALL
        (SELECT * FROM users_data WHERE sites_count=0 AND users_data.default_site='WAW02' LIMIT 1)
        UNION ALL
        (SELECT * FROM users_data WHERE sites_count=2 AND users_data.default_site='WAW02' LIMIT 1)
        UNION ALL
        (SELECT * FROM users_data WHERE sites_count=1 AND users_data.default_site='WAW03' LIMIT 1)
        ORDER BY role DESC
    `);
  }
  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
