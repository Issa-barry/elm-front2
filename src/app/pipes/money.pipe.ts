import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 
  name: 'money', 
  standalone: true, 
  pure: true 
})
export class MoneyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency: 'EUR' | 'GNF' | string = 'GNF',
    showSymbol: boolean = true
  ): string {
    // Gérer les valeurs nulles ou undefined
    if (value === null || value === undefined || value === '') {
      return showSymbol ? '0 GNF' : '0';
    }

    // Convertir en nombre
    const num = typeof value === 'string' ? parseFloat(value) : value;

    // Vérifier si c'est un nombre valide
    if (isNaN(num)) {
      return showSymbol ? '0 GNF' : '0';
    }

    // Arrondir (pas de décimales pour GNF)
    const rounded = Math.round(num);

    // Formater avec DOUBLE ESPACE comme séparateur de milliers (plus visible)
    const formatted = rounded
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '  '); // 👈 Deux espaces normaux

    // Symbole de la devise
    const symbol = currency === 'EUR' ? '€' : 'GNF';

    // Retourner avec ou sans symbole
    return showSymbol ? `${formatted} ${symbol}` : formatted;
  }
}