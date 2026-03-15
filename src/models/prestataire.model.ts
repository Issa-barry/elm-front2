export type PrestataireType = 'machiniste' | 'mecanicien' | 'consultant' | 'fournisseur';

export const PRESTATAIRE_TYPES: { value: PrestataireType; label: string }[] = [
  { value: 'machiniste', label: 'Machiniste' },
  { value: 'mecanicien', label: 'Mecanicien' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'fournisseur', label: 'Fournisseur' },
];

export interface Prestataire {
  id: number;
  nom: string;
  prenom: string;
  raison_sociale: string | null;
  phone: string;
  email: string | null;
  pays: string;
  code_pays: string;
  code_phone_pays: string;
  ville: string;
  quartier: string | null;
  adresse: string | null;
  specialite: string | null;
  type: PrestataireType | null;
  tarif_horaire: number | null;
  notes: string | null;
  reference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  nom_complet: string;
  type_label: string | null;
}

export interface CreatePrestataireDto {
  nom: string;
  prenom: string;
  phone: string;
  pays: string;
  code_pays: string;
  code_phone_pays: string;
  ville: string;
  raison_sociale?: string;
  email?: string;
  quartier?: string;
  adresse?: string;
  specialite?: string;
  type?: PrestataireType;
  tarif_horaire?: number;
  notes?: string;
}

export interface UpdatePrestataireDto {
  nom?: string;
  prenom?: string;
  raison_sociale?: string;
  phone?: string;
  email?: string;
  pays?: string;
  code_pays?: string;
  code_phone_pays?: string;
  ville?: string;
  quartier?: string;
  adresse?: string;
  specialite?: string;
  type?: PrestataireType;
  tarif_horaire?: number;
  notes?: string;
}
