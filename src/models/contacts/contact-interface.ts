import { PrestataireType } from '@/models/prestataire.model';

export interface ContactInterface {
  id?: string;
  nom?: string;
  prenom?: string;
  phone?: string; // Numéro de téléphone au format international
  code_pays?: string; // Code du pays du téléphone (ex: 'GN', 'FR', 'SN')
  pays?: string; // Nom du pays (ex: 'Guinée', 'France', 'Sénégal')
  type_piece?: { name: string; code: string } | null;
  numero_piece?: string;
  adresse?: string;
  ville?: string;
  quartier?: string;
  type?: PrestataireType | null;
  type_label?: string | null;
}
