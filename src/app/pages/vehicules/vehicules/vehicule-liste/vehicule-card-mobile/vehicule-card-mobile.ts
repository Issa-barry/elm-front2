import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Vehicule, TYPE_VEHICULE_LABELS } from '@/models/vehicule.model';

@Component({
  selector: 'app-vehicule-card-mobile',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, TagModule, TooltipModule],
  host: { class: 'mobile-vehicule-card' },
  template: `
    @if (vehicule.photo_url) {
      <img
        class="mobile-card-avatar-img"
        [src]="vehicule.photo_url"
        [alt]="vehicule.nom_vehicule"
        (error)="onImageError()"
      />
    } @else {
      <div class="mobile-card-avatar" aria-hidden="true">
        {{ getInitials(vehicule.nom_vehicule) }}
      </div>
    }

    <div class="mobile-card-body">
      <div class="mobile-card-name">{{ vehicule.nom_vehicule }}</div>
      <div class="mobile-card-meta">{{ vehicule.immatriculation }} · {{ getTypeLabel() }}</div>
      <div class="mobile-card-footer">
        <p-tag
          [value]="vehicule.is_active ? 'Actif' : 'Inactif'"
          [severity]="vehicule.is_active ? 'success' : 'danger'"
          styleClass="mobile-status-tag"
        />
        <div class="mobile-card-actions">
          <button
            pButton pRipple
            icon="pi pi-pencil"
            class="p-button-rounded p-button-text p-button-sm"
            pTooltip="Modifier"
            tooltipPosition="top"
            (click)="edit.emit(vehicule); $event.stopPropagation()"
          ></button>
        </div>
      </div>
    </div>
  `,
})
export class VehiculeCardMobile {
  @Input({ required: true }) vehicule!: Vehicule;
  @Output() edit = new EventEmitter<Vehicule>();

  getTypeLabel(): string {
    return TYPE_VEHICULE_LABELS[this.vehicule.type_vehicule] ?? this.vehicule.type_vehicule;
  }

  getInitials(name: string): string {
    const words = (name ?? '').split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return (words[0]?.substring(0, 2) ?? '??').toUpperCase();
  }

  onImageError(): void {
    (this.vehicule as any).photo_url = null;
  }
}
