import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UuidValidationPipePipe } from '../pipes/uuid-validation-pipe/uuid-validation-pipe.pipe';
import { Site } from '../entities/site.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() params: any): Promise<User[]> {
    const { page, perPage, orderBy, order, ...rest } = params;
    return await this.usersService.findAll(
      +page,
      +perPage,
      orderBy,
      order,
      rest,
    );
  }
  @Get(':uuid')
  findOne(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
  ): Promise<User> {
    return this.usersService.findOne(uuid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
