// ── Types ──────────────────────────────────────────────
export type UserType = 'staff' | 'client' | 'prestataire' | 'investisseur';

export type Civilite = 'M' | 'Mme' | 'Mlle';

export const CIVILITE_LABELS: Record<Civilite, string> = {
  M:   'M.',
  Mme: 'Mme',
  Mlle: 'Mlle',
};

export type PieceType = 'cni' | 'passeport' | 'permis' | 'carte_sejour';

export const PIECE_TYPE_LABELS: Record<PieceType, string> = {
  cni:          "Carte nationale d'identité",
  passeport:    'Passeport',
  permis:       'Permis de conduire',
  carte_sejour: 'Carte de séjour',
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
  staff:        'Staff',
  client:       'Client',
  prestataire:  'Prestataire',
  investisseur: 'Investisseur',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] ?? type;
}

// ── Interface principale ────────────────────────────────
export interface User {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  email: string | null;
  pays: string;
  code_pays: string;
  code_phone_pays: string;
  ville: string | null;
  quartier: string | null;
  reference: string;
  type: UserType;
  type_label?: string;          // optionnel : si l'API le renvoie, sinon utiliser getUserTypeLabel()
  is_active: boolean;
  is_archived: boolean;
  archived_at: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  nom_complet: string;
  roles?: string[];
  role_names?: string[];
  permissions?: string[];
  // Civilité & date de naissance
  civilite?: Civilite | null;
  date_naissance?: string | null;   // format YYYY-MM-DD
  // Champs optionnels étendus
  adresse?: string | null;
  language?: string | null;
  activated_at?: string | null;
  last_seen_at?: string | null;
  // Pièce d'identité
  piece_type?: PieceType | null;
  piece_numero?: string | null;
  piece_delivree_le?: string | null;
  piece_expire_le?: string | null;
  piece_pays?: string | null;
}

// ── DTO Création ────────────────────────────────────────
export interface CreateUserDto {
  nom: string;
  prenom: string;
  phone: string;
  email?: string | null;
  pays: string;
  code_pays: string;
  code_phone_pays: string;
  ville: string;
  quartier: string;
  password: string;
  password_confirmation: string;
  type: UserType;               // nature du compte (obligatoire)
  role: string;                 // rôle Spatie assigné à la création
  // Optionnels
  civilite?: Civilite | null;
  date_naissance?: string | null;   // format YYYY-MM-DD
  adresse?: string;
  language?: string;
  piece_type?: PieceType;
  piece_numero?: string;
  piece_delivree_le?: string;
  piece_expire_le?: string;
  piece_pays?: string;
}
