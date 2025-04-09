export class ShiftActivityDto {
  name: string;
  uuid: string;
  type?: string;
}

export class FindAllActivitiesDto {
  activity_types: ShiftActivityDto[];
  activities: ShiftActivityDto[];
}
