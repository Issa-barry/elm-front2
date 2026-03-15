import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DashboardService, VentesEvolutionStatutPeriod } from '@/services/dashboard/dashboard.service';

interface EvolutionStatutResponse {
  period: { key: string; from: string; to: string; granularity: string };
  labels: string[];
  datasets: Array<{ statut: string; label: string; data: number[] }>;
}

@Component({
  selector: 'app-bar-wiget',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './bar-wiget.html',
  styleUrl: './bar-wiget.scss',
  host: {
    '[style.display]': '"block"'
  }
})
export class BarWiget {
  readonly periodOptions: { label: string; value: VentesEvolutionStatutPeriod }[] = [
    { label: "Aujourd'hui", value: 'today' },
    { label: 'Hier', value: 'yesterday' },
    { label: 'Cette semaine', value: 'this_week' },
    { label: 'Semaine derniere', value: 'last_week' },
    { label: 'Ce mois', value: 'this_month' },
    { label: 'Mois dernier', value: 'last_month' },
    { label: 'T1', value: 'q1' },
    { label: 'T2', value: 'q2' },
    { label: 'T3', value: 'q3' },
    { label: 'T4', value: 'q4' },
    { label: 'S1', value: 's1' },
    { label: 'S2', value: 's2' },
    { label: 'Cette annee', value: 'this_year' },
    { label: 'Annee derniere', value: 'last_year' }
  ];

  selectedPeriod = signal<VentesEvolutionStatutPeriod>('today');

  loading = signal(false);
  error = signal<string | null>(null);
  chartData = signal<ChartData<'bar'> | null>(null);
  chartOptions = signal<ChartOptions<'bar'>>(this.buildOptions());

  private readonly dashboardService = inject(DashboardService);
  private readonly layoutService = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private loadRequestId = 0;

  constructor() {
    effect(() => {
      this.layoutService.layoutConfig().darkTheme;
      this.layoutService.layoutConfig().preset;
      this.layoutService.layoutConfig().surface;
      this.chartOptions.set(this.buildOptions());
    });

    effect(() => {
      const period = this.selectedPeriod();
      this.load(period);
    });
  }

  onPeriodChange(period: VentesEvolutionStatutPeriod): void {
    this.selectedPeriod.set(period);
  }

  private load(period: VentesEvolutionStatutPeriod): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService
      .getVentesEvolutionParStatut(period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d: EvolutionStatutResponse) => {
          if (requestId !== this.loadRequestId) return;
          const labelByStatut: Record<string, string> = {
            payee: 'Payees',
            partiel: 'Partielles',
            partielle: 'Partielles',
            impayee: 'Impayees',
            annulee: 'Annulees'
          };

          const colorByStatut: Record<string, string> = {
            payee: '#22c55e',
            partiel: '#f97316',
            partielle: '#f97316',
            impayee: '#ef4444',
            annulee: '#64748b'
          };

          const datasetByStatut = new Map(
            d.datasets.map((dataset) => [dataset.statut, dataset] as const)
          );

          const orderedDatasets = ['payee', 'partiel', 'partielle', 'impayee', 'annulee']
            .map((statut) => datasetByStatut.get(statut))
            .filter((dataset): dataset is EvolutionStatutResponse['datasets'][number] => !!dataset);

          const fallbackDatasets = orderedDatasets.length > 0 ? orderedDatasets : d.datasets;

          this.chartData.set({
            labels: d.labels,
            datasets: fallbackDatasets.map((ds) => {
              return {
                label: labelByStatut[ds.statut] ?? ds.label,
                data: ds.data,
                backgroundColor: colorByStatut[ds.statut] ?? '#94a3b8',
                borderColor: colorByStatut[ds.statut] ?? '#94a3b8',
                borderRadius: 4
              };
            })
          });
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
          this.error.set('Erreur de chargement');
          this.chartData.set(null);
          this.loading.set(false);
        }
      });
  }

  private buildOptions(): ChartOptions<'bar'> {
    const textColor = this.readCssVar('--text-color', '#1f2937');
    const textColorSecondary = this.readCssVar('--text-color-secondary', '#6b7280');
    const surfaceBorder = this.readCssVar('--surface-border', '#e2e8f0');

    return {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            usePointStyle: false
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => {
              return `${ctx.dataset.label}: ${Number(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} GNF`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          border: {
            display: false
          },
          grid: {
            display: false
          },
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          }
        },
        y: {
          stacked: false,
          beginAtZero: true,
          border: {
            display: false
          },
          grid: {
            color: surfaceBorder
          },
          ticks: {
            color: textColorSecondary
          }
        }
      }
    };
  }

  private readCssVar(name: string, fallback: string): string {
    if (!isPlatformBrowser(this.platformId)) {
      return fallback;
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }
}
