import { User } from './user.model';

export interface MeResponse {
    user?: User;
    roles?: any[];
    role_names?: string[];
    permissions?: any[] | Record<string, any>;
    [key: string]: any;
}
