export interface Forfait {
  id: number;
  slug: string;
  nom: string;
  prix: string;         // decimal string depuis l'API ("50000.00")
  description?: string | null;
  is_active: boolean;
}

export interface ForfaitPayload {
  slug: string;
  nom: string;
  prix?: number | null;
  description?: string | null;
  is_active?: boolean;
}

/**
 * Retourne les classes Tailwind de badge selon le slug du forfait.
 * Slugs connus : starter (gris), standard (bleu), premium (jaune).
 * Slugs inconnus → gris neutre par défaut.
 */
export function getForfaitBadgeClasses(slug: string | null | undefined): string {
  const map: Record<string, string> = {
    starter:  'bg-gray-100 text-gray-700',
    standard: 'bg-blue-100 text-blue-700',
    premium:  'bg-yellow-100 text-yellow-700',
  };
  return map[slug ?? ''] ?? 'bg-gray-100 text-gray-600';
}

export function formatForfaitPrix(prix: string | null | undefined): string {
  if (!prix) return '0 GNF';
  const n = parseFloat(prix);
  if (isNaN(n)) return prix;
  return new Intl.NumberFormat('fr-FR').format(n) + ' GNF';
}
