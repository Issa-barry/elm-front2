// Shared domain types for legacy "usine" and current "site" terminology.

export type UsineType = 'production' | 'distribution' | 'stockage' | 'mixte' | 'siege' | string;
export type UsineStatut = 'actif' | 'inactif' | 'archive' | 'active' | 'inactive' | 'archived' | string;
export type UsineSubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled' | string;

export type SiteType = UsineType;
export type SiteStatut = UsineStatut;
export type SiteSubscriptionStatus = UsineSubscriptionStatus;

export interface UsineRole {
  id: number;
  name: string;
}

/** Legacy shape kept for backward compatibility. */
export interface AccessibleUsine {
  id: number;
  nom: string;
  code?: string;
  type?: UsineType;
  statut?: UsineStatut;
  subscription_status?: UsineSubscriptionStatus;
  adresse?: string | null;
  quartier?: string | null;
  ville?: string | null;
  pays?: string | null;
}

export type AccessibleSite = AccessibleUsine;

/** Legacy shape kept for backward compatibility. */
export interface Usine {
  id: number;
  nom: string;
  code?: string;
  type?: UsineType;
  statut?: UsineStatut;
  subscription_status?: UsineSubscriptionStatus;
  localisation?: string | null;
  adresse?: string | null;
  quartier?: string | null;
  ville?: string | null;
  pays?: string | null;
  description?: string | null;
  parent_id?: number | null;
  organisation_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type Site = Usine;

/**
 * /auth/me response (supports old usine keys and current site keys).
 */
export interface MeResponse {
  user: Record<string, unknown>;
  roles: string[];
  permissions: string[];
  accessible_sites?: AccessibleSite[];
  default_site_id?: number | null;
  current_site_id?: number | null;
  accessible_usines?: AccessibleUsine[];
  default_usine_id?: number | null;
  current_usine_id?: number | null;
  is_siege_user: boolean;
}

export interface CreateUsineDto {
  nom: string;
  code?: string;
  type?: UsineType;
  adresse?: string;
}

export type UpdateUsineDto = Partial<CreateUsineDto>;

export interface AssignUserToUsineDto {
  user_id: number;
  role?: string;
}

export interface CreateSiteDto {
  nom: string;
  code: string;
  type: SiteType;
  statut?: SiteStatut;
  localisation?: string | null;
  pays?: string | null;
  ville?: string | null;
  quartier?: string | null;
  description?: string | null;
  parent_id?: number | null;
}

export type UpdateSiteDto = Partial<CreateSiteDto>;

export interface AssignUserToSiteDto {
  user_id: number;
  role?: string;
  is_default?: boolean;
}
