export type StatutFacture = 'impayee' | 'partiel' | 'payee' | 'annulee';
export type StatutCommandeVente = 'active' | 'annulee' | 'cloturee';
export type ModePaiement = 'especes' | 'mobile_money' | 'virement' | 'cheque';

export const STATUT_FACTURE_LABELS: Record<StatutFacture, string> = {
  impayee: 'Impayée',
  partiel: 'Partielle',
  payee: 'Payée',
  annulee: 'Annulée',
};

export const STATUT_FACTURE_SEVERITY: Record<
  StatutFacture,
  'success' | 'info' | 'warn' | 'danger' | 'secondary'
> = {
  impayee: 'danger',
  partiel: 'warn',
  payee: 'success',
  annulee: 'secondary',
};

export const MODE_PAIEMENT_OPTIONS: { label: string; value: ModePaiement }[] = [
  { label: 'Espèces', value: 'especes' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
];

// ── Véhicule (résumé dans les factures/commandes) ─────────────────────

export interface FactureVenteVehicule {
  id: number;
  nom_vehicule: string;
  immatriculation: string;
  photo_url?: string;
  proprietaire?: { nom: string; prenom: string; phone?: string };
  livreurPrincipal?: { nom: string; prenom: string; phone?: string };
  livreur_principal?: { nom: string; prenom: string; phone?: string };
}

// ── Factures ──────────────────────────────────────────────────────────

export interface FactureVente {
  id: number;
  reference: string;
  vehicule_id: number;
  commande_vente_id: number;
  usine_id: number;
  montant_brut: string;
  montant_net: string;
  montant_encaisse: number;
  montant_restant: number;
  statut_facture: StatutFacture;
  vehicule?: FactureVenteVehicule;
  encaissements?: EncaissementVente[];
  created_at: string;
}

// ── Encaissements ─────────────────────────────────────────────────────

export interface EncaissementVente {
  id: number;
  facture_vente_id: number;
  montant: string;
  date_encaissement: string;
  mode_paiement: ModePaiement;
  note?: string;
}

export interface StoreEncaissementVenteDto {
  facture_vente_id: number;
  montant: number;
  date_encaissement: string;
  mode_paiement: ModePaiement;
  note?: string;
}

// ── Commandes ─────────────────────────────────────────────────────────

export interface LigneCommandeVente {
  id: number;
  commande_vente_id: number;
  produit_id: number;
  qte: number;
  prix_usine_snapshot: number;
  prix_vente_snapshot: number;
  total_ligne: string;
  produit?: { id: number; nom: string; image_url?: string | null };
}

export interface CommandeVenteActor {
  id: number;
  nom?: string;
  prenom?: string;
  phone?: string;
  name?: string;
  nom_complet?: string;
}

export interface CommandeVente {
  id: number;
  usine_id: number;
  vehicule_id: number;
  reference: string;
  total_commande: string;
  statut?: StatutCommandeVente;
  motif_annulation?: string | null;
  annulee_at?: string | null;
  annulee_par?: { id: number; nom?: string; prenom?: string } | null;
  created_by?: CommandeVenteActor | number | null;
  updated_by?: CommandeVenteActor | number | null;
  created_by_user?: CommandeVenteActor | null;
  updated_by_user?: CommandeVenteActor | null;
  creator?: CommandeVenteActor | null;
  vehicule?: FactureVenteVehicule;
  lignes?: LigneCommandeVente[];
  facture?: Pick<
    FactureVente,
    'id' | 'reference' | 'montant_brut' | 'montant_net' | 'statut_facture' | 'montant_encaisse' | 'montant_restant' | 'encaissements'
  >;
  commission?: CommissionResume;
  created_at: string;
}

export interface AnnulerCommandeVenteDto {
  motif_annulation: string;
}

export interface StoreLigneCommandeDto {
  produit_id: number;
  qte: number;
  prix_vente?: number;
}

export interface StoreCommandeVenteDto {
  vehicule_id: number;
  lignes: StoreLigneCommandeDto[];
}

export interface UpdateCommandeVenteDto {
  vehicule_id?: number;
  lignes?: StoreLigneCommandeDto[];
}

// ── Commissions ────────────────────────────────────────────────────────

export type StatutCommission = 'impayee' | 'partielle' | 'payee' | 'annulee';

export type StatutVersement = 'en_attente' | 'partiellement_verse' | 'effectue' | 'annule';
export type BeneficiaireType = 'livreur' | 'proprietaire';

export const STATUT_COMMISSION_LABELS: Record<StatutCommission, string> = {
  impayee: 'Impayée',
  partielle: 'Partielle',
  payee: 'Payée',
  annulee: 'Annulée',
};

export const STATUT_COMMISSION_SEVERITY: Record<
  StatutCommission,
  'success' | 'info' | 'warn' | 'danger' | 'secondary'
> = {
  impayee: 'danger',
  partielle: 'warn',
  payee: 'success',
  annulee: 'secondary',
};

export const STATUT_VERSEMENT_LABELS: Record<StatutVersement, string> = {
  en_attente: 'En attente',
  partiellement_verse: 'Partiel',
  effectue: 'Versé',
  annule: 'Annulé',
};

export const STATUT_VERSEMENT_SEVERITY: Record<
  StatutVersement,
  'success' | 'info' | 'warn' | 'danger' | 'secondary'
> = {
  en_attente: 'warn',
  partiellement_verse: 'info',
  effectue: 'success',
  annule: 'danger',
};

export interface Beneficiaire {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
}

export interface VersementCommission {
  id: number;
  commission_vente_id: number;
  beneficiaire_type: BeneficiaireType;
  beneficiaire_id: number;
  montant_attendu: string;
  montant_verse: string | null;
  montant_restant?: number;
  statut: StatutVersement;
  verse_at: string | null;
  date_versement?: string | null;
  note: string | null;
}

/** Résumé embarqué dans CommandeVente */
export interface CommissionResume {
  id: number;
  statut: StatutCommission;
  montant_commission_total: string;
  part_livreur: string;
  part_proprietaire: string;
}

/** Alias conservé pour rétrocompatibilité */
export type CommissionVenteSummary = CommissionResume;

export interface CommissionVente extends CommissionResume {
  commande_vente_id: number;
  vehicule_id: number;
  livreur_id: number | null;
  proprietaire_id: number | null;
  taux_livreur_snapshot: string;
  eligible_at: string | null;
  created_at: string;
  commande?: { id: number; reference: string; total_commande: string };
  vehicule?: { id: number; nom_vehicule: string; immatriculation: string };
  livreur?: Beneficiaire | null;
  proprietaire?: Beneficiaire | null;
  versements: VersementCommission[];
}

export interface StoreVersementDto {
  montant: number;
  date_paiement: string;
  mode_paiement: ModePaiement;
  note?: string;
}
