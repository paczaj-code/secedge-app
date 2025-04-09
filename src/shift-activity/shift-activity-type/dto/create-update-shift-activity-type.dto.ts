import { User } from '../../../entities/user.entity';

export class CreateUpdateShiftActivityTypeDto {
  name: string;
  description: string;
  created_by: User;
}
