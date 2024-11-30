import { UserRoles } from '../../enums/userRoles';

export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isInitPassword: boolean;
  role: UserRoles;
  defaultSiteId: number;
  isActive: boolean;
  otherSites: number[];
  creatorId?: number;
}
