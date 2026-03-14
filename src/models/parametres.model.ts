// Types
export type ParametreType = 'string' | 'integer' | 'boolean' | 'json';
export type ParametreGroupe = 'general' | 'packing' | 'paiement';

export const PARAMETRE_GROUPE_LABELS: Record<ParametreGroupe, string> = {
  general: 'Général',
  packing: 'Packing',
  paiement: 'Paiement'
};

export class Parametre {
  id: number = 0;
  cle: string = '';
  valeur: any = null;
  valeur_brute: string = '';
  type: ParametreType = 'string';
  groupe: ParametreGroupe = 'general';
  groupe_label: string = '';
  description: string = '';

  constructor(data?: Partial<Parametre>) {
    if (data) Object.assign(this, data);
  }

  static fromApi(data: any): Parametre {
    return new Parametre(data);
  } 
  static fromApiArray(data: any[]): Parametre[] {
    return data.map(item => Parametre.fromApi(item));
  }
}

// Interface pour la réponse des périodes
export interface Periode {
  numero: number;
  label: string;
  debut: string;
  fin: string;
}

export interface PeriodesResponse {
  mois: number;
  annee: number;
  mois_label: string;
  periodes: Periode[];
  prix_rouleau_defaut: number;
}

// DTO pour mise à jour
export interface UpdateParametreDto {
  valeur: any;
}
