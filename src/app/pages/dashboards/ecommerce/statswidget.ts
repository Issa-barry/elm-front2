import { Component, OnDestroy, computed, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, DashboardStats } from '@/services/dashboard/dashboard.service';
import { DashboardPeriod, DashboardPeriodService } from '@/services/dashboard/dashboard-period.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, FormsModule, SelectModule, SkeletonModule],
    template: `
        <div class="col-span-12 flex items-center justify-end">
            <p-select
                [ngModel]="periodService.period()"
                (ngModelChange)="onPeriodChange($event)"
                [options]="periodOptions"
                optionLabel="label"
                optionValue="value"
                appendTo="body"
                styleClass="w-[220px]"
            />
        </div>

        @if (loading) {
            @for (i of [1, 2, 3, 4, 5]; track i) {
                <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                    <div class="card h-full">
                        <p-skeleton height="1.5rem" width="60%" />
                        <p-skeleton height="0.75rem" width="40%" styleClass="mt-1 mb-4" />
                        <div class="flex justify-between items-start">
                            <div class="w-6/12">
                                <p-skeleton height="2.5rem" width="80%" styleClass="mb-2" />
                                <p-skeleton height="1rem" width="50%" />
                            </div>
                            <div class="w-6/12">
                                <p-skeleton height="4rem" />
                            </div>
                        </div>
                    </div>
                </div>
            }
        }

        @if (!loading && stats) {
            <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                <div class="card h-full">
                    <span class="font-semibold text-lg">Prestataires</span>
                    <div class="text-xs text-surface-400 mt-0.5 mb-4">{{ periodSubtitle() }}</div>
                    <div class="flex justify-between items-start">
                        <div class="w-6/12">
                            <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ stats.prestataires.value }}</span>
                            <div [class]="trendClass(stats.prestataires.trend)">
                                <span class="font-medium">{{ formatDelta(stats.prestataires.delta_pct) }}</span>
                                @if (stats.prestataires.trend !== 'flat') {
                                    <i [class]="trendIcon(stats.prestataires.trend)"></i>
                                }
                            </div>
                        </div>
                        <div class="w-6/12">
                            <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    [attr.d]="sparklinePath(stats.prestataires.sparkline)"
                                    [style]="{ strokeWidth: '2px', stroke: strokeColor(stats.prestataires.trend) }"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

           

            <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                <div class="card h-full">
                    <span class="font-semibold text-lg">Utilisateurs</span>
                    <div class="text-xs text-surface-400 mt-0.5 mb-4">{{ periodSubtitle() }}</div>
                    <div class="flex justify-between items-start">
                        <div class="w-6/12">
                            <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ stats.utilisateurs.value }}</span>
                            <div [class]="trendClass(stats.utilisateurs.trend)">
                                <span class="font-medium">{{ formatDelta(stats.utilisateurs.delta_pct) }}</span>
                                @if (stats.utilisateurs.trend !== 'flat') {
                                    <i [class]="trendIcon(stats.utilisateurs.trend)"></i>
                                }
                            </div>
                        </div>
                        <div class="w-6/12">
                            <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    [attr.d]="sparklinePath(stats.utilisateurs.sparkline)"
                                    [style]="{ strokeWidth: '2px', stroke: strokeColor(stats.utilisateurs.trend) }"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                <div class="card h-full">
                    <span class="font-semibold text-lg">Vehicules</span>
                    <div class="text-xs text-surface-400 mt-0.5 mb-4">{{ periodSubtitle() }}</div>
                    <div class="flex justify-between items-start">
                        <div class="w-6/12">
                            <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ stats.vehicules.value }}</span>
                            <div [class]="trendClass(stats.vehicules.trend)">
                                <span class="font-medium">{{ formatDelta(stats.vehicules.delta_pct) }}</span>
                                @if (stats.vehicules.trend !== 'flat') {
                                    <i [class]="trendIcon(stats.vehicules.trend)"></i>
                                }
                            </div>
                        </div>
                        <div class="w-6/12">
                            <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    [attr.d]="sparklinePath(stats.vehicules.sparkline)"
                                    [style]="{ strokeWidth: '2px', stroke: strokeColor(stats.vehicules.trend) }"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
             <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                <div class="card h-full">
                    <span class="font-semibold text-lg">Packing</span>
                    <div class="text-xs text-surface-400 mt-0.5 mb-4">{{ periodSubtitle() }}</div>
                    <div class="flex justify-between items-start">
                        <div class="w-6/12">
                            <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ stats.packings.value }}</span>
                            <div [class]="trendClass(stats.packings.trend)">
                                <span class="font-medium">{{ formatDelta(stats.packings.delta_pct) }}</span>
                                @if (stats.packings.trend !== 'flat') {
                                    <i [class]="trendIcon(stats.packings.trend)"></i>
                                }
                            </div>
                        </div>
                        <div class="w-6/12">
                            <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    [attr.d]="sparklinePath(stats.packings.sparkline)"
                                    [style]="{ strokeWidth: '2px', stroke: strokeColor(stats.packings.trend) }"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3 self-start">
                <div class="card h-full">
                    <span class="font-semibold text-lg">Rouleaux en stock</span>
                    <div class="text-xs text-surface-400 mt-0.5 mb-4">{{ periodSubtitle() }}</div>
                    <div class="flex justify-between items-start">
                        <div class="w-6/12">
                            <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ stats.rouleaux_stock.value }}</span>
                            <div [class]="trendClass(stats.rouleaux_stock.trend)">
                                <span class="font-medium">{{ formatDelta(stats.rouleaux_stock.delta_pct) }}</span>
                                @if (stats.rouleaux_stock.trend !== 'flat') {
                                    <i [class]="trendIcon(stats.rouleaux_stock.trend)"></i>
                                }
                            </div>
                        </div>
                        <div class="w-6/12">
                            <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    [attr.d]="sparklinePath(stats.rouleaux_stock.sparkline)"
                                    [style]="{ strokeWidth: '2px', stroke: strokeColor(stats.rouleaux_stock.trend) }"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        }
    `,
    host: {
        '[style.display]': '"contents"'
    }
})
export class StatsWidget implements OnDestroy {
    private readonly dashboardService = inject(DashboardService);
    readonly periodService = inject(DashboardPeriodService);

    readonly periodOptions: Array<{ label: string; value: DashboardPeriod }> = [
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Hier', value: 'yesterday' },
        { label: 'Cette semaine', value: 'this_week' },
        { label: 'Semaine derniere', value: 'last_week' },
        { label: 'Ce mois', value: 'this_month' },
        { label: 'Mois dernier', value: 'last_month' },
        { label: 'Cette annee', value: 'this_year' },
        { label: 'Annee derniere', value: 'last_year' }
    ];

    stats: DashboardStats | null = null;
    loading = true;

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
    }

    onPeriodChange(period: DashboardPeriod): void {
        this.periodService.setPeriod(period);
    }

    ngOnDestroy(): void {
        this.cancel$.next();
        this.cancel$.complete();
    }

    private load(period: string, days: number): void {
        this.loading = true;
        this.stats = null;
        this.cancel$.next();

        this.dashboardService
            .getStats(period, period === 'last_x_days' ? days : undefined)
            .pipe(takeUntil(this.cancel$))
            .subscribe({
                next: (data) => {
                    this.stats = data;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
    }

    periodSubtitle(): string {
        const label = this.periodService.currentLabel();
        if (!this.stats) return label;
        const { from, to } = this.stats.period;
        return `${label} - ${this.formatDateRange(from, to)}`;
    }

    private formatDateRange(from: string, to: string): string {
        const f = new Date(from + 'T00:00:00');
        const t = new Date(to + 'T00:00:00');

        if (from === to) {
            return f.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        const sameMonthYear = f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear();
        if (sameMonthYear) {
            return `${f.getDate()}-${t.getDate()} ${t.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
        }

        const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${fmt(f)} - ${fmt(t)}`;
    }

    sparklinePath(points: number[]): string {
        if (!points || points.length < 2) return '';
        const width = 258;
        const height = 96;
        const pad = 5;
        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min || 1;
        const step = (width - pad * 2) / (points.length - 1);

        return points
            .map((point, index) => {
                const x = pad + index * step;
                const y = height - pad - ((point - min) / range) * (height - pad * 2);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ');
    }

    trendClass(trend: string): string {
        if (trend === 'up') return 'text-green-500';
        if (trend === 'down') return 'text-pink-500';
        return 'text-surface-400';
    }

    trendIcon(trend: string): string {
        if (trend === 'up') return 'pi pi-arrow-up text-xs ml-2';
        if (trend === 'down') return 'pi pi-arrow-down text-xs ml-2';
        return '';
    }

    strokeColor(trend: string): string {
        return trend === 'down' ? 'var(--p-pink-500)' : 'var(--primary-color)';
    }

    formatDelta(delta: number | null): string {
        if (delta === null) return '-';
        return `${delta >= 0 ? '+' : ''}${delta}%`;
    }
}
