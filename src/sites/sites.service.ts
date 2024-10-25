import { Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site) private readonly siteRepository: Repository<Site>,
  ) {}

  create(createSiteDto: CreateSiteDto) {
    return 'This action adds a new site';
  }

  findAll() {
    return this.siteRepository.find();
  }

  async findOne(uuid: string) {
    console.log(uuid);
    const result = await this.siteRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
    console.log(result);
    return result;
  }

  update(id: number, updateSiteDto: UpdateSiteDto) {
    return `This action updates a #${id} site`;
  }

  remove(id: number) {
    return `This action removes a #${id} site`;
  }
}
