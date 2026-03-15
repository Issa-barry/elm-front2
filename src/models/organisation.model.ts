import { Forfait } from './forfait.model';

export type OrganisationStatut = 'active' | 'inactive' | 'archived' | string;

export interface Organisation {
  id: number;
  nom: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  pays?: string | null;
  ville?: string | null;
  quartier?: string | null;
  adresse?: string | null;
  description?: string | null;
  statut?: OrganisationStatut;
  forfait_id?: number | null;
  forfait?: Pick<Forfait, 'id' | 'slug' | 'nom' | 'prix'> | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrganisationPayload {
  nom: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  pays?: string | null;
  ville?: string | null;
  quartier?: string | null;
  adresse?: string | null;
  description?: string | null;
  statut?: OrganisationStatut;
  forfait_id?: number | null;
}
