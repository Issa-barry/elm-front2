import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from '@/app/layout/service/layout.service';
import { DashboardService, VehiculeParType } from '@/services/dashboard/dashboard.service';
import { DashboardPeriodService } from '@/services/dashboard/dashboard-period.service';

const BG_PALETTE = ['--p-primary-700', '--p-primary-500', '--p-primary-400', '--p-primary-300', '--p-primary-100'];
const HOVER_PALETTE = ['--p-primary-600', '--p-primary-400', '--p-primary-300', '--p-primary-200', '--p-primary-50'];

@Component({
    standalone: true,
    selector: 'app-vehicules-categorie-widget',
    imports: [CommonModule, ChartModule, SkeletonModule],
    template: `
        <div class="card h-full">
            <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">Categorie de vehicule</div>

            @if (loading()) {
                <div class="flex justify-center">
                    <p-skeleton shape="circle" size="300px" />
                </div>
            } @else if (!hasData()) {
                <div class="text-surface-500 text-sm text-center py-8">Aucune categorie de vehicule disponible.</div>
            } @else {
                <p-chart type="pie" [data]="pieData()" height="300" [options]="pieOptions()"></p-chart>
            }
        </div>
    `,
})
export class VehiculesCategorieWidget implements OnDestroy {
    private readonly layoutService = inject(LayoutService);
    private readonly dashboardService = inject(DashboardService);
    private readonly periodService = inject(DashboardPeriodService);

    pieData = signal<any>(null);
    pieOptions = signal<any>(null);
    loading = signal(true);
    private readonly vehiculesParType = signal<VehiculeParType[]>([]);
    readonly hasData = computed(() => this.vehiculesParType().length > 0);

    private readonly cancel$ = new Subject<void>();

    private readonly effectKey = computed(() => {
        const period = this.periodService.period();
        const days = period === 'last_x_days' ? this.periodService.customDays() : 0;
        return { period, days };
    });

    constructor() {
        effect(() => {
            const { period, days } = this.effectKey();
            untracked(() => this.load(period, days));
        });

        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            this.layoutService.layoutConfig().preset;
            this.layoutService.layoutConfig().surface;
            this.vehiculesParType();
            setTimeout(() => this.initChart(), 50);
        });
    }

    ngOnDestroy(): void {
        this.cancel$.next();
        this.cancel$.complete();
    }

    private load(period: string, days: number): void {
        this.loading.set(true);
        this.cancel$.next();

        this.dashboardService
            .getStats(period, period === 'last_x_days' ? days : undefined)
            .pipe(takeUntil(this.cancel$))
            .subscribe({
                next: (data) => {
                    this.vehiculesParType.set(data.vehicules_par_type ?? []);
                    this.loading.set(false);
                    this.initChart();
                },
                error: () => {
                    this.vehiculesParType.set([]);
                    this.loading.set(false);
                    this.initChart();
                },
            });
    }

    private initChart(): void {
        const style = getComputedStyle(document.documentElement);
        const textColor = style.getPropertyValue('--text-color');
        const list = this.vehiculesParType();

        this.pieData.set({
            labels: list.map((item) => item.label),
            datasets: [
                {
                    data: list.map((item) => item.count),
                    backgroundColor: list.map((_, index) => style.getPropertyValue(BG_PALETTE[index % BG_PALETTE.length])),
                    hoverBackgroundColor: list.map((_, index) => style.getPropertyValue(HOVER_PALETTE[index % HOVER_PALETTE.length])),
                },
            ],
        });

        this.pieOptions.set({
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: { weight: 700 },
                        padding: 28,
                    },
                    position: 'bottom',
                },
            },
        });
    }
}
