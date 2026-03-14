// Types alignés avec le backend Laravel (TypeVehicule enum)
export type TypeVehicule = 'camion' | 'vanne' | 'tricycle' | 'pick_up' | 'autre';

export const TYPE_VEHICULE_OPTIONS: { label: string; value: TypeVehicule }[] = [
  { label: 'Camion',   value: 'camion' },
  { label: 'Vanne',    value: 'vanne' },
  { label: 'Tricycle', value: 'tricycle' },
  { label: 'Pick-up',  value: 'pick_up' },
  { label: 'Autre',    value: 'autre' },
];

/** Capacité par défaut auto-remplie selon le type (correspond au backend) */
export const CAPACITE_DEFAULTS: Partial<Record<TypeVehicule, number>> = {
  camion:   300,
  vanne:    150,
  tricycle: 70,
  pick_up:  100,
};

export const TYPE_VEHICULE_LABELS: Record<TypeVehicule, string> = {
  camion:   'Camion',
  vanne:    'Vanne',
  tricycle: 'Tricycle',
  pick_up:  'Pick-up',
  autre:    'Autre',
};

export interface Proprietaire {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  email?: string;
  pays?: string;
  ville?: string;
  quartier?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Livreur {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicule {
  id: number;
  usine_id: number;
  nom_vehicule: string;
  marque?: string | null;
  modele?: string | null;
  immatriculation: string;
  type_vehicule: TypeVehicule;
  capacite_packs: number;
  proprietaire_id: number;
  proprietaire?: Proprietaire;
  livreur_principal_id?: number | null;
  /** snake_case depuis l'API (compatibilité) */
  livreur_principal?: Livreur | null;
  /** camelCase sérialisé par VehiculeResource */
  livreurPrincipal?: Livreur | null;
  photo_path?: string;
  photo_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface VehiculeFilters {
  search?: string;
  per_page?: number;
  statut?: 'actif' | 'inactif';
}
