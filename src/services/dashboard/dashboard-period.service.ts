import { Injectable, computed, signal } from '@angular/core';

export type DashboardPeriod =
  | 'today' | 'yesterday'
  | 'this_week' | 'last_week'
  | 'this_month' | 'last_month'
  | 'q1' | 'q2' | 'q3' | 'q4'
  | 's1' | 's2'
  | 'this_year' | 'last_year'
  | 'last_x_days';

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today:       "Aujourd'hui",
  yesterday:   'Hier',
  this_week:   'Cette semaine',
  last_week:   'Semaine dernière',
  this_month:  'Ce mois',
  last_month:  'Mois dernier',
  q1: 'T1 (Jan–Mar)', q2: 'T2 (Avr–Jun)',
  q3: 'T3 (Jul–Sep)', q4: 'T4 (Oct–Déc)',
  s1: 'S1 (Jan–Jun)', s2: 'S2 (Jul–Déc)',
  this_year:   'Cette année',
  last_year:   'Année dernière',
  last_x_days: 'X derniers jours',
};

@Injectable({ providedIn: 'root' })
export class DashboardPeriodService {
  readonly period     = signal<DashboardPeriod>('this_month');
  readonly customDays = signal<number>(30);

  readonly currentLabel = computed(() => {
    const p = this.period();
    if (p === 'last_x_days') return `${this.customDays()} derniers jours`;
    return PERIOD_LABELS[p];
  });

  setPeriod(p: DashboardPeriod): void {
    this.period.set(p);
  }

  setCustomDays(days: number): void {
    this.customDays.set(days);
  }
}
