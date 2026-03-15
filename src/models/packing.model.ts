import { Prestataire } from './prestataire.model';

// ========================= Statuts Packing =========================

export type PackingStatut = 'impayee' | 'partielle' | 'payee' | 'annulee';

export const PACKING_STATUT_LABELS: Record<PackingStatut, string> = {
  impayee: 'Impayée',
  partielle: 'Partielle',
  payee: 'Payée',
  annulee: 'Annulée',
};

export type PackingStatutSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const PACKING_STATUT_SEVERITY: Record<PackingStatut, PackingStatutSeverity> = {
  impayee: 'danger',
  partielle: 'warn',
  payee: 'success',
  annulee: 'secondary',
};

// ========================= Modes de paiement =========================

export type ModePaiement = 'especes' | 'virement' | 'cheque' | 'mobile_money';

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  especes: 'Espèces',
  virement: 'Virement bancaire',
  cheque: 'Chèque',
  mobile_money: 'Mobile Money',
};

// ========================= Versement =========================

export interface Versement {
  id: number;
  packing_id: number;
  reference: string;
  montant: number;
  date_versement: string;
  mode_paiement: ModePaiement;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Appended
  mode_paiement_label: string;
  creator?: { id: number; nom: string; prenom: string; nom_complet: string };
}

export interface StoreVersementDto {
  montant: number;
  date_versement: string;
  mode_paiement?: ModePaiement;
  notes?: string;
}

// Réponse de GET /packings/{id}/versements
export interface VersementIndexResponse {
  packing: Packing;
  versements: Versement[];
}

// ========================= Packing =========================

export interface Packing {
  id: number;
  prestataire_id: number;
  reference: string;
  date: string | Date;
  nb_rouleaux: number;
  prix_par_rouleau: number;
  montant: number;
  statut: PackingStatut;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Appended
  statut_label?: string;
  prestataire_nom?: string;
  montant_verse: number;
  montant_restant: number;

  // Relations
  prestataire?: Prestataire;
  versements?: Versement[];
}

// DTO pour création
export interface CreatePackingDto {
  prestataire_id: number;
  date: string;
  nb_rouleaux: number;
  prix_par_rouleau: number;
  notes?: string;
}

// DTO pour mise à jour
export interface UpdatePackingDto {
  prestataire_id?: number;
  date?: string;
  nb_rouleaux?: number;
  prix_par_rouleau?: number;
  notes?: string;
}

// Interface pour les filtres
export interface PackingFilters {
  prestataire_id?: number;
  statut?: PackingStatut;
  date_debut?: string;
  date_fin?: string;
  non_payes?: boolean;
  search?: string;
  sort_by?: 'date' | 'created_at' | 'montant' | 'nb_rouleaux' | 'statut';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// DTO pour changement de statut
export interface ChangePackingStatutDto {
  statut: PackingStatut;
}
