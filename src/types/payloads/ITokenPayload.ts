import { UserRoles } from '../enums';

export interface ITokenPayload {
    userId: string;
    role: UserRoles;
}
