// models/produit.model.ts

export interface UserBasic {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
}

// Enums alignés avec l'API Laravel
export type ProduitStatut = 'brouillon' | 'actif' | 'inactif' | 'archive';
export type ProduitType = 'materiel' | 'service' | 'fabricable' | 'achat_vente';

// Labels français pour l'affichage
export const PRODUIT_TYPE_LABELS: Record<ProduitType, string> = {
  materiel: 'Matériel',
  service: 'Service',
  fabricable: 'Fabricable',
  achat_vente: 'Achat/Vente'
};

export const PRODUIT_STATUT_LABELS: Record<ProduitStatut, string> = {
  brouillon: 'Brouillon',
  actif: 'Actif',
  inactif: 'Inactif',
  archive: 'Archivé',
};

export type ProduitStatutSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

// Severites PrimeNG pour les tags de statut
export const PRODUIT_STATUT_SEVERITY: Record<ProduitStatut, ProduitStatutSeverity> = {
  brouillon: 'secondary',
  actif: 'success',
  inactif: 'danger',
  archive: 'danger',
};

// Classes CSS pour les badges de statut
export const PRODUIT_STATUT_COLORS: Record<ProduitStatut, string> = {
  brouillon: 'bg-gray-100 text-gray-800',
  actif: 'bg-green-100 text-green-800',
  inactif: 'bg-yellow-100 text-yellow-800',
  archive: 'bg-red-100 text-red-800',
};

// ── Objets imbriqués retournés par l'API ──────────────────────────────────────

export interface StockCourant {
  id: number;
  produit_id: number;
  usine_id: number;
  qte_stock: number;
  seuil_alerte_stock: number;
}

export interface ProduitUsineCourant {
  id: number;
  produit_id: number;
  usine_id: number;
  is_active: boolean;
  prix_usine: number | null;
  prix_achat: number | null;
  prix_vente: number | null;
  cout: number | null;
  tva: number | null;
}

export interface PrixEffectifs {
  prix_usine: number | null;
  prix_achat: number | null;
  prix_vente: number | null;
  cout: number | null;
  tva: number | null;
}

export interface StockAlert {
  seuil_stock_faible: number;
  niveau: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  message: string | null;
}

// Réponse de PATCH /produits/{id}/stock
export interface UpdateStockResponse {
  produit: any;
  ancien_stock: number;
  nouveau_stock: number;
  difference: number;
  stock_alert: StockAlert;
}

// Réponse de PATCH /produits/{id}/usines/{usineId}/prix
export interface PrixLocalResponse {
  config: ProduitUsineCourant;
  prix_effectifs: PrixEffectifs;
}

// ── DTO Usine config ──────────────────────────────────────────────────────────

export interface UsineAffectation {
  usine_id: number;
  is_active?: boolean;
  prix_vente?: number | null;
  prix_achat?: number | null;
  prix_usine?: number | null;
  tva?: number | null;
}

export interface UpdatePrixLocalDto {
  prix_vente?: number | null;
  prix_achat?: number | null;
  prix_usine?: number | null;
  cout?: number | null;
  tva?: number | null;
}

// ── Classe Produit ────────────────────────────────────────────────────────────

export class Produit {
  id: number = 0;
  nom: string = '';
  code: string = '';
  code_interne: string | null = null;
  code_fournisseur: string | null = null;

  // Prix globaux de référence
  prix_usine: number | null = null;
  prix_vente: number | null = null;
  prix_achat: number | null = null;
  cout: number | null = null;

  // Stock de l'usine courante (issu de stock_courant.qte_stock via fromApi)
  qte_stock: number = 0;

  /** Seuil d'alerte stock (issu de stock_courant.seuil_alerte_stock via fromApi). null = seuil global. */
  seuil_alerte_stock: number | null = null;

  statut: ProduitStatut = 'brouillon';
  type: ProduitType = 'materiel';

  /** true = produit visible par toutes les usines, géré au niveau siège */
  is_global: boolean = false;
  /** null si global, sinon ID de l'usine propriétaire */
  usine_id: number | null = null;

  in_stock: boolean = true;
  is_archived: boolean = false;
  is_critique: boolean = false;
  is_out_of_stock: boolean = false;
  is_low_stock: boolean = false;
  low_stock_threshold: number = 10;

  archived_at: string | null = null;
  description: string | null = null;
  image_url: string | null = null;

  created_at: string = '';
  updated_at: string = '';

  // Objets imbriqués (usine courante)
  stock_courant: StockCourant | null = null;
  produit_usine_courant: ProduitUsineCourant | null = null;

  creator?: UserBasic;

  constructor(data?: Partial<Produit>) {
    if (data) Object.assign(this, data);
  }

  /**
   * Retourne l'URL complète de l'image.
   */
  getImageUrl(defaultImage: string = 'assets/demo/images/no-product.png'): string {
    if (!this.image_url) return defaultImage;
    if (this.image_url.startsWith('http://') || this.image_url.startsWith('https://')) {
      return this.image_url;
    }
    return `assets/demo/images/produits/${this.image_url}`;
  }

  formatPrix(prix: number | null, currency: string = 'GNF'): string {
    const value = typeof prix === 'number' ? prix : 0;
    return `${value.toLocaleString('fr-FR')} ${currency}`;
  }

  /**
   * Prix effectifs pour l'usine courante :
   * prix local non-null > prix global. Utiliser au POS.
   */
  getPrixEffectifs(): PrixEffectifs {
    const local = this.produit_usine_courant;
    return {
      prix_usine:  local?.prix_usine  ?? this.prix_usine,
      prix_achat:  local?.prix_achat  ?? this.prix_achat,
      prix_vente:  local?.prix_vente  ?? this.prix_vente,
      cout:        local?.cout        ?? this.cout,
      tva:         local?.tva         ?? null,
    };
  }

  static fromApi(data: any): Produit {
    return new Produit({
      ...data,
      prix_usine:  data?.prix_usine  != null ? Number(data.prix_usine)  : null,
      prix_vente:  data?.prix_vente  != null ? Number(data.prix_vente)  : null,
      prix_achat:  data?.prix_achat  != null ? Number(data.prix_achat)  : null,
      cout:        data?.cout        != null ? Number(data.cout)        : null,
      is_global:   data?.is_global   ?? data?.is_systeme ?? false,
      usine_id:    data?.usine_id    ?? null,
      is_critique: data?.is_critique ?? false,
      is_low_stock:     data?.is_low_stock     ?? false,
      low_stock_threshold: data?.low_stock_threshold ?? 10,
      is_out_of_stock: data?.is_out_of_stock ?? false,
      stock_courant:         data?.stock_courant         ?? null,
      produit_usine_courant: data?.produit_usine_courant ?? null,
      // qte_stock : priorité stock_courant, sinon champ racine (compat ancienne API)
      qte_stock: data?.stock_courant?.qte_stock != null
        ? Number(data.stock_courant.qte_stock)
        : (data?.qte_stock != null ? Number(data.qte_stock) : 0),
      seuil_alerte_stock: data?.stock_courant?.seuil_alerte_stock != null
        ? Number(data.stock_courant.seuil_alerte_stock)
        : (data?.seuil_alerte_stock != null ? Number(data.seuil_alerte_stock) : null),
    });
  }

  static fromApiArray(data: any[]): Produit[] {
    return data.map(item => Produit.fromApi(item));
  }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateProduitDto {
  nom: string;
  type: ProduitType;
  /** Ignoré à la création (stock initial toujours 0 côté backend). Utilisé en édition via PUT. */
  qte_stock?: number;

  code?: string;
  code_interne?: string;
  code_fournisseur?: string;
  /** Non envoyé à la création — le backend impose toujours 'brouillon'. Utilisé en édition via PUT. */
  statut?: ProduitStatut;
  cout?: number;
  description?: string;

  prix_usine?: number;
  prix_vente?: number;
  prix_achat?: number;

  is_critique?: boolean;
  is_global?: boolean;
  /** Seuil d'alerte stock par produit. null = seuil global. */
  seuil_alerte_stock?: number | null;
  image?: File;
  /** Affectations initiales aux usines (optionnel) */
  usines?: UsineAffectation[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Interface pour la pagination
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Interface pour les paramètres de recherche/filtrage
export interface ProduitSearchParams {
  search?: string;
  type?: ProduitType;
  statut?: ProduitStatut;
  in_stock?: boolean;
  disponibles?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Interface pour les statistiques (alignée sur l'API)
export interface ProduitStatistics {
  total_produits: number;
  produits_en_stock: number;
  produits_en_rupture: number;
  produits_stock_faible: number;
  seuil_stock_faible: number;
  produits_actifs: number;
  produits_inactifs: number;
  valeur_stock_total: number;
  valeur_achat_total: number;
  valeur_usine_total: number;
  stock_total: number;
  produit_plus_cher: any | null;
  produit_moins_cher: any | null;
  types: { type: ProduitType; count: number }[];
}

// DTO pour la mise à jour du stock
export interface UpdateStockDto {
  quantite: number;
  operation?: 'set' | 'add' | 'subtract';
}

// DTO pour le changement de statut
export interface ChangeStatusDto {
  statut: ProduitStatut;
}
