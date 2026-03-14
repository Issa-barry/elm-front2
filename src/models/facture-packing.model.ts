import { Packing } from './packing.model';
import { Prestataire } from './prestataire.model';

// Types pour le mode de paiement (sur les versements)
export type ModePaiement = 'especes' | 'virement' | 'cheque' | 'mobile_money';

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  especes: 'Espèces',
  virement: 'Virement bancaire',
  cheque: 'Chèque',
  mobile_money: 'Mobile Money',
};

// Types pour le statut de la facture
export type FacturePackingStatut = 'impayee' | 'partielle' | 'payee' | 'annulee';

export const FACTURE_PACKING_STATUT_LABELS: Record<FacturePackingStatut, string> = {
  impayee: 'Impayée',
  partielle: 'Partiellement payée',
  payee: 'Payée',
  annulee: 'Annulée',
};

export type FacturePackingStatutSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export const FACTURE_PACKING_STATUT_SEVERITY: Record<FacturePackingStatut, FacturePackingStatutSeverity> = {
  impayee: 'danger',
  partielle: 'warn',
  payee: 'success',
  annulee: 'secondary',
};

// ========================= Versement =========================

export class Versement {
  id: number;
  facture_packing_id: number;
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

  // Relations
  creator?: { id: number; name: string };
  facture_packing?: FacturePacking;

  constructor(data: Partial<Versement> = {}) {
    this.id = data.id ?? 0;
    this.facture_packing_id = data.facture_packing_id ?? 0;
    this.montant = data.montant ?? 0;
    this.date_versement = data.date_versement ?? '';
    this.mode_paiement = data.mode_paiement ?? 'especes';
    this.notes = data.notes ?? null;
    this.created_by = data.created_by ?? null;
    this.created_at = data.created_at ?? '';
    this.updated_at = data.updated_at ?? '';
    this.deleted_at = data.deleted_at ?? null;

    this.mode_paiement_label = data.mode_paiement_label ?? MODE_PAIEMENT_LABELS[this.mode_paiement] ?? '';
    this.creator = data.creator;
    this.facture_packing = data.facture_packing;
  }
}

export interface StoreVersementDto {
  montant: number;
  date_versement: string;
  mode_paiement?: ModePaiement;
  notes?: string;
}

// Réponse de GET /{id}/versements
export interface VersementIndexResponse {
  facture_id: number;
  reference: string;
  montant_total: number;
  montant_verse: number;
  montant_restant: number;
  is_soldee: boolean;
  versements: Versement[];
}

// Réponse de POST /{id}/versements
export interface VersementStoreResponse {
  versement: Versement;
  facture: FacturePacking;
}

// ========================= FacturePacking =========================

export class FacturePacking {
  id: number;
  reference: string;
  prestataire_id: number;
  date: string;
  montant_total: number;
  nb_packings: number;
  date_paiement: string | null;
  mode_paiement: ModePaiement | null;
  statut: FacturePackingStatut;
  notes: string | null;
  created_by: number | null;
  validated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Appended attributes
  statut_label: string;
  prestataire_nom: string | null;
  montant_verse: number;
  montant_restant: number;
  mode_paiement_label: string;
  total_rouleaux: number;
  prix_par_rouleau: number;

  // Relations
  prestataire?: Prestataire;
  packings?: Packing[];
  versements?: Versement[];
  creator?: { id: number; name: string };

  constructor(data: Partial<FacturePacking> = {}) {
    this.id = data.id ?? 0;
    this.reference = data.reference ?? '';
    this.prestataire_id = data.prestataire_id ?? 0;
    this.date = data.date ?? '';
    this.montant_total = data.montant_total ?? 0;
    this.nb_packings = data.nb_packings ?? 0;
    this.date_paiement = data.date_paiement ?? null;
    this.mode_paiement = data.mode_paiement ?? null;
    this.statut = data.statut ?? 'impayee';
    this.notes = data.notes ?? null;
    this.created_by = data.created_by ?? null;
    this.validated_by = data.validated_by ?? null;
    this.created_at = data.created_at ?? '';
    this.updated_at = data.updated_at ?? '';
    this.deleted_at = data.deleted_at ?? null;

    this.statut_label = data.statut_label ?? FACTURE_PACKING_STATUT_LABELS[this.statut] ?? '';
    this.prestataire_nom = data.prestataire_nom ?? null;
    this.montant_verse = data.montant_verse ?? 0;
    this.montant_restant = data.montant_restant ?? 0;
    this.mode_paiement_label = data.mode_paiement_label ?? '';
    this.total_rouleaux = data.total_rouleaux ?? (data.packings?.reduce((s, p) => s + (p.nb_rouleaux ?? 0), 0) ?? 0);
    this.prix_par_rouleau = data.prix_par_rouleau ?? (data.packings?.[0]?.prix_par_rouleau ?? 0);

    this.prestataire = data.prestataire;
    this.packings = data.packings;
    this.versements = data.versements;
    this.creator = data.creator;
  }
}

// DTO pour créer une facture
export interface StoreFacturePackingDto {
  prestataire_id: number;
  date_debut: string;
  date_fin: string;
  statut?: FacturePackingStatut;
  notes?: string;
}

// ========================= Comptabilité =========================

// Ligne comptabilité par prestataire (retour de /comptabilite)
export class ComptabilitePrestataire {
  prestataire_id: number;
  prestataire_nom: string;
  prestataire_phone: string;
  prestataire_type: string;

  // Packings non encore facturés
  nb_packings_non_factures: number;
  montant_non_facture: number;

  // Factures en cours (facturées mais pas soldées)
  nb_factures_en_cours: number;
  montant_facture: number;
  montant_verse: number;
  montant_restant_facture: number;

  // Total dû (non facturé + restant sur factures)
  montant_total_du: number;

  // Dernière date d'activité
  derniere_date: string | null;

  // Statut calculé
  statut: 'impaye' | 'partiel' | 'solde';

  constructor(data: Partial<ComptabilitePrestataire> = {}) {
    this.prestataire_id = data.prestataire_id ?? 0;
    this.prestataire_nom = data.prestataire_nom ?? '';
    this.prestataire_phone = data.prestataire_phone ?? '';
    this.prestataire_type = data.prestataire_type ?? '';

    this.nb_packings_non_factures = data.nb_packings_non_factures ?? 0;
    this.montant_non_facture = data.montant_non_facture ?? 0;

    this.nb_factures_en_cours = data.nb_factures_en_cours ?? 0;
    this.montant_facture = data.montant_facture ?? 0;
    this.montant_verse = data.montant_verse ?? 0;
    this.montant_restant_facture = data.montant_restant_facture ?? 0;

    this.montant_total_du = data.montant_total_du ?? 0;
    this.derniere_date = data.derniere_date ?? null;

    this.statut = this.montant_total_du === 0 ? 'solde'
      : this.montant_verse > 0 ? 'partiel'
      : 'impaye';
  }
}

// Résumé comptabilité (réponse complète de /comptabilite)
export class ComptabiliteSummary {
  date_debut: string | null;
  date_fin: string | null;
  nb_prestataires: number;

  // Totaux non facturés
  total_non_facture: number;

  // Totaux facturés
  total_facture: number;
  total_verse: number;
  total_restant_facture: number;

  // Total global dû
  montant_global_du: number;

  // Total global (facturé + non facturé)
  montant_total: number;

  prestataires: ComptabilitePrestataire[];

  constructor(data: Partial<ComptabiliteSummary> = {}) {
    this.date_debut = data.date_debut ?? null;
    this.date_fin = data.date_fin ?? null;
    this.nb_prestataires = data.nb_prestataires ?? 0;

    this.total_non_facture = data.total_non_facture ?? 0;

    this.total_facture = data.total_facture ?? 0;
    this.total_verse = data.total_verse ?? 0;
    this.total_restant_facture = data.total_restant_facture ?? 0;

    this.montant_global_du = data.montant_global_du ?? 0;

    this.montant_total = (this.total_facture + this.total_non_facture);

    this.prestataires = (data.prestataires ?? []).map(p => new ComptabilitePrestataire(p));
  }
}

// Prévisualisation facture (retour de /preview)
export class PreviewFacturePacking {
  prestataire_id: number;
  date_debut: string;
  date_fin: string;
  nb_packings: number;
  montant_total: number;
  total_rouleaux: number;
  packings: Packing[];

  constructor(data: Partial<PreviewFacturePacking> = {}) {
    this.prestataire_id = data.prestataire_id ?? 0;
    this.date_debut = data.date_debut ?? '';
    this.date_fin = data.date_fin ?? '';
    this.nb_packings = data.nb_packings ?? 0;
    this.montant_total = data.montant_total ?? 0;
    this.total_rouleaux = data.total_rouleaux ?? 0;
    this.packings = data.packings ?? [];
  }
}

// Filtres pour la liste des factures
export interface FacturePackingFilters {
  prestataire_id?: number;
  date_debut?: string;
  date_fin?: string;
  statut?: FacturePackingStatut;
  soldee?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'montant_total' | 'nb_packings' | 'date';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

// Filtres pour la comptabilité
export interface ComptabiliteFilters {
  date_debut?: string;
  date_fin?: string;
  prestataire_id?: number;
}
