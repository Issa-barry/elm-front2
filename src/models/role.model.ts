import { User } from './user.model';

export interface Role {
  id: number;
  name: string;
  created_at: string;
}

export interface ModulePermission {
  module: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface RoleWithModules {
  role: Role;
  modules: ModulePermission[];
}

export interface CreateRoleDto {
  name: string;
}

export interface UpdateRoleDto {
  name: string;
}

export interface UpdatePermissionsDto {
  permissions: Record<string, string[]>;
}

export interface AssignedUserRoleData {
  user: User;
  roles: string[];
  permissions: string[];
}

export interface UserRoles {
  user_id: number;
  nom_complet: string;
  roles: string[];
  permissions: string[];
}

export interface PermissionCatalogModule extends ModulePermission {
  actions: string[];
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export const PERMISSION_ACTIONS: PermissionAction[] = ['create', 'read', 'update', 'delete'];
