import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';
import { Not, Repository } from 'typeorm';
import { BaseDatabaseService } from '../generic/baseDatabase/baseDatabase.service';

/**
 * Service that handles operations related to sites.
 */
@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site) private readonly siteRepository: Repository<Site>,
    private readonly databaseService2: BaseDatabaseService<typeof Site>,
  ) {}

  /**
   * Creates a new site entity based on the provided data transfer object.
   *
   * @param {CreateSiteDto} createSiteDto - The data transfer object containing information to create a new site.
   * @return {Promise<Site>} A promise that resolves to the created site entity.
   * @throws {HttpException} If there is an error during the creation process.
   */
  async create(createSiteDto: CreateSiteDto): Promise<Site> {
    try {
      await this.validateNameUnique(createSiteDto.name);
      const result = await this.databaseService2.createEntity(
        Site,
        createSiteDto,
      );
      return { ...createSiteDto, ...result.generatedMaps };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  /**
   * Fetches all site entities from the repository and orders them by site name.
   *
   * @return {Promise<Array>} A promise resolving to an array of site entities.
   */
  async findAll(): Promise<Array<any>> {
    return await this.siteRepository
      .createQueryBuilder('site')
      .orderBy('site.name')
      .getMany();
  }

  /**
   * Retrieves a single site based on the provided UUID.
   *
   * @param {string} uuid - The unique identifier for the site to be retrieved.
   * @return {Promise<Site | HttpException>} A promise that resolves to the site object if found.
   * @throws {HttpException} If the site is not found, an exception is thrown with status NOT_FOUND.
   */
  async findOne(uuid: string): Promise<Site | HttpException> {
    const site = await this.siteRepository.query(
      `
          WITH site_id AS (SELECT id
                           FROM sites
                           WHERE uuid = $1),

               audits AS (SELECT s.name,
                                 acs.weekday,
                                 acs.shift_number,
                                 sa.name AS audit_name,
                                 acs.time
                          FROM activity_to_site AS acs
                                   INNER JOIN public.sites s ON s.id = acs.site_id
                                   INNER JOIN public.shift_activity sa ON sa.id = acs.activity_id
                          WHERE s.id = (SELECT id FROM site_id)
                            and weekday IS NOT NULL
                          ORDER BY acs.weekday),
               patrols AS (SELECT s.name,
                                  acs.time,
                                  sa.name as patrol_name
                           FROM activity_to_site AS acs
                                    INNER JOIN public.sites s on s.id = acs.site_id
                                    INNER JOIN public.shift_activity sa on acs.activity_id = sa.id
                           WHERE s.id = (SELECT id FROM site_id)
                             and weekday IS NULL
                           ORDER BY acs.time),
               users_ids AS (SELECT id
                             FROM users
                             WHERE "defaultSiteId" = (SELECT id
                                                      FROM sites
                                                      WHERE sites.id = (SELECT id FROM site_id))
                             UNION
                             SELECT DISTINCT "usersId"
                             FROM users_other_sites_sites
                             WHERE "sitesId" = (SELECT id
                                                FROM sites
                                                WHERE sites.id = (SELECT id FROM site_id))),
               users AS (SELECT DISTINCT users.id,
                                         users.uuid,
                                         users.first_name,
                                         users.last_name,
                                         users.email,
                                         users.phone,
                                         users.role,
                                         s.name AS default_site,
                                         (SELECT json_agg(s_sub.name)::text as other_sites
                                          FROM users_other_sites_sites
                                                   JOIN public.sites s_sub on s_sub.id = users_other_sites_sites."sitesId"
                                          WHERE "usersId" = users.id)
                         FROM users
                                  JOIN public.sites s on s.id = users."defaultSiteId"
                         WHERE users.id IN (SELECT id FROM users_ids))
          SELECT name,
                 uuid,
                 address,
                 description,
                 created_at,
                 updated_at,
                 (SELECT json_agg(audits) as audits
                  FROM audits),
                 (SELECT json_agg(patrols) as patrols
                  FROM patrols),
                 (SELECT json_agg(users) as users
                  FROM users)
          FROM sites
          WHERE sites.id = (SELECT id FROM site_id)

    `,
      [uuid],
    );
    // const site = await this.siteRepository.findOne({
    //   where: {
    //     uuid: uuid,
    //   },
    // });
    if (!site.length)
      throw new HttpException('Site not found', HttpStatus.NOT_FOUND);
    return site[0];
  }

  /**
   * Updates an existing site entity with the provided data.
   *
   * @param {string} uuid - The unique identifier of the site to be updated.
   * @param {UpdateSiteDto} updateSiteDto - The data transfer object containing the updated site information.
   * @return {Promise<Site>} - A promise that resolves to the updated site entity.
   * @throws {HttpException} - Throws an HTTP exception if validation or update process fails.
   */
  async update(uuid: string, updateSiteDto: UpdateSiteDto): Promise<Site> {
    try {
      await this.validateNameUnique(updateSiteDto.name, uuid);
      return this.databaseService2.updateEntity(Site, uuid, updateSiteDto);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  /**
   * Validates if a site name is unique within the repository. If a UUID is provided,
   * it ensures the name uniqueness excluding the specified UUID.
   *
   * @param {string} name - The name of the site to be checked for uniqueness.
   * @param {string|null} uuid - The UUID of the site to be excluded from the check (optional).
   * @return {Promise<void>} - Resolves if the name is unique, otherwise throws an HttpException.
   */
  async validateNameUnique(
    name: string,
    uuid: string | null = null,
  ): Promise<void> {
    const whereCondition = uuid
      ? { name: name, uuid: Not(uuid) }
      : { name: name };

    const result = await this.siteRepository.findOne({ where: whereCondition });

    if (result) {
      throw new HttpException(
        'Such site name already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
