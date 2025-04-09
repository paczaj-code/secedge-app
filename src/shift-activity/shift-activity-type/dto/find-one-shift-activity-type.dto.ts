export class FindOneShiftActivityTypeDto {
  id: number;
  uuid: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by?: {
    uuid: string;
    first_name: string;
    last_name: string;
  } | null;
  activities?: Array<{
    id: number;
    uuid: string;
    name: string;
  }>;
}
