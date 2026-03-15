import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DashboardService, VentesParTypePeriod } from '@/services/dashboard/dashboard.service';

interface ParTypeItem {
    type_vehicule: string;
    label: string;
    ca_total: number;
    nb_commandes: number;
}

@Component({
    selector: 'app-donught-wiget',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, SkeletonModule, ChartModule],
    templateUrl: './donught-wiget.html',
    styleUrl: './donught-wiget.scss'
})
export class DonughtWiget {
    readonly periodOptions: { label: string; value: VentesParTypePeriod }[] = [
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Cette semaine', value: 'this_week' },
        { label: 'Ce mois', value: 'this_month' },
        { label: 'Mois dernier', value: 'last_month' },
        { label: 'Cette annee', value: 'this_year' },
        { label: 'Annee derniere', value: 'last_year' }
    ];

    selectedPeriod = signal<VentesParTypePeriod>('today');
    loading = signal(false);
    errorMessage = signal<string | null>(null);
    private rawData = signal<ParTypeItem[]>([]);
    private loadRequestId = 0;

    readonly hasData = computed(() => {
        const items = this.rawData();
        if (!items.length) {
            return false;
        }
        const totalCa = items.reduce((sum, item) => sum + (Number(item.ca_total) || 0), 0);
        return totalCa > 0;
    });

    pieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
    pieOptions: ChartOptions<'doughnut'> = {};

    private readonly dashboardService = inject(DashboardService);
    private readonly layoutService = inject(LayoutService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly platformId = inject(PLATFORM_ID);

    constructor() {
        effect(() => {
            this.selectedPeriod();
            this.load(this.selectedPeriod());
        });

        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            this.layoutService.layoutConfig().preset;
            setTimeout(() => this.initCharts(), 100);
        });
    }

    onPeriodChange(period: VentesParTypePeriod): void {
        this.selectedPeriod.set(period);
    }

    private load(period: VentesParTypePeriod): void {
        const requestId = ++this.loadRequestId;
        this.loading.set(true);
        this.errorMessage.set(null);

        this.dashboardService
            .getVentesParTypeVehicule(period)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (requestId !== this.loadRequestId) {
                        return;
                    }
                    this.rawData.set((res?.par_type ?? []) as ParTypeItem[]);
                    this.initCharts();
                    this.loading.set(false);
                },
                error: () => {
                    if (requestId !== this.loadRequestId) {
                        return;
                    }
                    this.rawData.set([]);
                    this.errorMessage.set('Erreur de chargement');
                    this.loading.set(false);
                }
            });
    }

    private initCharts(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');

        const colorMap: Record<string, string> = {
            camion: documentStyle.getPropertyValue('--p-indigo-500'),
            tricycle: documentStyle.getPropertyValue('--p-purple-500'),
            vanne: documentStyle.getPropertyValue('--p-teal-500')
        };
        const hoverMap: Record<string, string> = {
            camion: documentStyle.getPropertyValue('--p-indigo-400'),
            tricycle: documentStyle.getPropertyValue('--p-purple-400'),
            vanne: documentStyle.getPropertyValue('--p-teal-400')
        };

        const gray500 = documentStyle.getPropertyValue('--p-gray-500');
        const gray400 = documentStyle.getPropertyValue('--p-gray-400');

        const items = this.rawData();

        this.pieData = {
            labels: items.map((i) => i.label),
            datasets: [
                {
                    data: items.map((i) => Number(i.ca_total) || 0),
                    backgroundColor: items.map((i) => colorMap[i.type_vehicule] ?? gray500),
                    hoverBackgroundColor: items.map((i) => hoverMap[i.type_vehicule] ?? gray400)
                }
            ]
        };

        this.pieOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        padding: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx: { dataIndex: number }) => {
                            const item = items[ctx.dataIndex];
                            if (!item) {
                                return '';
                            }

                            return `${item.label}: ${Number(item.ca_total || 0).toLocaleString('fr-FR')} GNF (${Number(item.nb_commandes || 0)} cmd)`;
                        }
                    }
                }
            },
            cutout: '62%',
            color: textColorSecondary
        };
    }
}
