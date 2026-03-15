import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SoldeCardWidget } from '../../widgets/solde-card-widget/solde-card-widget';

@Component({
  selector: 'app-ventedashboard-mobile-cards',
  standalone: true,
  imports: [CommonModule, SoldeCardWidget],
  templateUrl: './ventedashboard-mobile-cards.html',
  styleUrl: './ventedashboard-mobile-cards.scss',
  host: {
    '[style.display]': '"contents"'
  }
})
export class VentedashboardMobileCards {
  @ViewChild('cardsCarousel', { static: false }) cardsCarousel?: ElementRef<HTMLElement>;

  @Input() cardsLoading = false;
  @Input() totalFacturesMontant = 0;
  @Input() totalFacturesCount = 0;
  @Input() facturesPayeesMontant = 0;
  @Input() facturesPayeesCount = 0;
  @Input() resteAEncaisserMontant = 0;
  @Input() facturesImpayeesCount = 0;
  @Input() facturesAnnuleesCount = 0;

  activeCardIndex = 0;
  readonly cardIndexes = [0, 1, 2];

  onCardsScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.mobile-card-slide'));
    if (cards.length === 0) return;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - container.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    this.activeCardIndex = nearestIndex;
  }

  scrollToCard(index: number): void {
    const container = this.cardsCarousel?.nativeElement;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('.mobile-card-slide');
    const card = cards.item(index);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    this.activeCardIndex = index;
  }
}
