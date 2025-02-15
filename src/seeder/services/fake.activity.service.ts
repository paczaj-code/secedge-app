import { Injectable } from '@nestjs/common';
import { fakeSites } from './fake.site';
import { ShiftActivity } from '../../entities/shift-activity.entity';
import { EntityManager } from 'typeorm';
import { ActivityToSite } from '../../entities/activity-to-site.entity';

@Injectable()
export class FakeActivityService {
  constructor(private entityManager: EntityManager) {}
  async generateFakeActivities() {
    await this.firstShiftPatrols();
    await this.secondShiftPatrols();
    await this.badgeAudits();
    await this.cameraAudits();
    await this.keyAudits();
    await this.challengeTracker();
  }

  async firstShiftPatrols() {
    const virtualPatrolHours: string[] = ['10:30', '18:30'];
    const physicalPatrolHour = '14:30';
    const virtualPatrols = await this.getActivityByName('Virtual patrol');
    const physicalPatrols = await this.getActivityByName('Physical patrol');

    for (const site of fakeSites) {
      const aa: Partial<ActivityToSite> = {
        shift_number: 1,
        activity_id: physicalPatrols[0].id,
        site_id: site.id,
        time: physicalPatrolHour,
        is_daily: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, aa);
    }

    for (const site of fakeSites) {
      for (const virtualPatrolHour of virtualPatrolHours) {
        const patrol: Partial<ActivityToSite> = {
          shift_number: 1,
          activity_id: virtualPatrols[0].id,
          site_id: site.id,
          time: virtualPatrolHour,
          is_daily: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        await this.entityManager.insert(ActivityToSite, patrol);
      }
    }
  }

  async secondShiftPatrols() {
    const virtualPatrolHours: string = '02:30';
    const physicalPatrolHours = ['22:30', '06:30'];
    const virtualPatrols = await this.getActivityByName('Virtual patrol');
    const physicalPatrols = await this.getActivityByName('Physical patrol');

    for (const site of fakeSites) {
      const aa: Partial<ActivityToSite> = {
        shift_number: 2,
        activity_id: virtualPatrols[0].id,
        site_id: site.id,
        time: virtualPatrolHours,
        is_daily: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, aa);
    }
    for (const site of fakeSites) {
      for (const physicalPatrolHour of physicalPatrolHours) {
        const patrol: Partial<ActivityToSite> = {
          shift_number: 2,
          activity_id: physicalPatrols[0].id,
          site_id: site.id,
          time: physicalPatrolHour,
          is_daily: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        await this.entityManager.insert(ActivityToSite, patrol);
      }
    }
  }

  async getActivityByName(name: string) {
    return await this.entityManager.find(ShiftActivity, {
      where: {
        name: name,
      },
    });
  }

  async badgeAudits() {
    const badgeAudit = await this.getActivityByName('Badge audit');
    const sites = fakeSites.filter((site) => site.name !== 'WAW01');
    const weekDay = 6;
    for (const site of sites) {
      const audit: Partial<ActivityToSite> = {
        shift_number: 1,
        site_id: site.id,
        weekday: weekDay,
        activity_id: badgeAudit[0].id,
        is_daily: false,
        time: '11:00',
        updated_at: new Date(),
        created_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, audit);
    }
  }

  async cameraAudits() {
    const cameraAudits = await this.getActivityByName('Camera audit');
    const weekDay = 0;
    for (const site of fakeSites) {
      const audit: Partial<ActivityToSite> = {
        shift_number: 1,
        site_id: site.id,
        weekday: weekDay,
        activity_id: cameraAudits[0].id,
        is_daily: false,
        time: '11:00',
        updated_at: new Date(),
        created_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, audit);
    }
  }

  async keyAudits() {
    const keyAudit = await this.getActivityByName('Key audit');
    const weekDays = [1, 5];
    for (const site of fakeSites) {
      for (const weekDay of weekDays) {
        const audit: Partial<ActivityToSite> = {
          shift_number: 2,
          site_id: site.id,
          weekday: weekDay,
          activity_id: keyAudit[0].id,
          is_daily: false,
          time: '21:00',
          updated_at: new Date(),
          created_at: new Date(),
        };
        await this.entityManager.insert(ActivityToSite, audit);
      }
    }
  }

  async challengeTracker() {
    const ct = await this.getActivityByName('Challenge tracker');
    for (const site of fakeSites) {
      const audit: Partial<ActivityToSite> = {
        shift_number: 1,
        site_id: site.id,
        weekday: 6,
        activity_id: ct[0].id,
        is_daily: false,
        time: '11:00',
        updated_at: new Date(),
        created_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, audit);
    }
    for (const site of fakeSites) {
      const audit: Partial<ActivityToSite> = {
        shift_number: 2,
        site_id: site.id,
        weekday: 3,
        activity_id: ct[0].id,
        is_daily: false,
        time: '21:00',
        updated_at: new Date(),
        created_at: new Date(),
      };
      await this.entityManager.insert(ActivityToSite, audit);
    }
  }
}
