export type FactureLivraisonStatut = 'impayee' | 'partielle' | 'payee' | 'annulee';
export type ModePaiementLivraison = 'especes' | 'virement' | 'cheque' | 'mobile_money';

export const FACTURE_LIV_STATUT_LABELS: Record<FactureLivraisonStatut, string> = {
  impayee: 'Impayée',
  partielle: 'Partielle',
  payee: 'Payée',
  annulee: 'Annulée',
};

export const FACTURE_LIV_STATUT_SEVERITY: Record<
  FactureLivraisonStatut,
  'success' | 'info' | 'warn' | 'danger' | 'secondary'
> = {
  impayee: 'danger',
  partielle: 'warn',
  payee: 'success',
  annulee: 'secondary',
};

export const MODE_PAIEMENT_OPTIONS: { label: string; value: ModePaiementLivraison }[] = [
  { label: 'Espèces', value: 'especes' },
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Mobile Money', value: 'mobile_money' },
];

export interface FactureLivraison {
  id: number;
  vehicule_id: number;
  vehicule?: {
    id: number;
    marque: string;
    modele: string;
    immatriculation: string;
  };
  montant: number;
  montant_encaisse?: number;
  montant_restant?: number;
  statut: FactureLivraisonStatut;
  date_facture: string;
  description?: string;
  encaissements?: EncaissementLivraison[];
  commission?: CommissionCalcul;
  created_at: string;
}

export interface StoreFactureLivraisonDto {
  vehicule_id: number;
  montant: number;
  date_facture: string;
  description?: string;
}

export interface EncaissementLivraison {
  id: number;
  facture_livraison_id?: number;
  vehicule_id?: number;
  montant: number;
  mode_paiement: ModePaiementLivraison;
  date_encaissement: string;
  notes?: string;
  created_at?: string;
}

export interface StoreEncaissementLivraisonDto {
  facture_livraison_id?: number;
  montant: number;
  mode_paiement: ModePaiementLivraison;
  date_encaissement: string;
  notes?: string;
}

export interface CommissionCalcul {
  montant_net: number;
  montant_proprietaire: number;
  montant_livreur: number;
  part_proprietaire_pct: number;
  part_livreur_pct: number;
  est_payee: boolean;
}

export interface PaiementCommissionDto {
  mode_paiement: ModePaiementLivraison;
  notes?: string;
}

export interface StoreDeductionDto {
  montant: number;
  motif: string;
}
