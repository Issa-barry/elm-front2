import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type StatCardVariant = 'primary' | 'default';
export type StatValueFormat = 'number' | 'text';

@Component({
  selector: 'app-solde-card-widget',
  standalone: true,
    imports: [CommonModule, SkeletonModule],
  templateUrl: './solde-card-widget.html',
  styleUrl: './solde-card-widget.scss',
  host: {
        '[style.display]': '"contents"'
    }
})
export class SoldeCardWidget {
  @Input() title = '';
    @Input() value: number | string | null = 0;
    @Input() subtitle = '';
    @Input() loading = false;
    @Input() suffix = 'GNF';
    @Input() format: StatValueFormat = 'number';
    @Input() variant: StatCardVariant = 'default';
    @Input() columnClass = 'col-span-12 md:col-span-6 xl:col-span-4';
}
