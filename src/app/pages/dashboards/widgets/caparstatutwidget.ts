import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import {
    DashboardService,
    DashboardVentesParTypeData,
    StatutRow,
    VenteFactureStatus,
    VentesParTypePeriod
} from '@/services/dashboard/dashboard.service';

type StatutTag = {
    value: string;
    severity: 'success' | 'warn' | 'danger' | 'secondary';
};

@Component({
    standalone: true,
    selector: 'app-ca-par-statut-widget',
    imports: [CommonModule, FormsModule, TableModule, TagModule, SelectModule, SkeletonModule, ButtonModule],
    template: `
        <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold">
                    CA par statut de facture
                </div>
                <div class="sm:ml-auto">
                    <p-select
                        [options]="periodOptions"
                        [(ngModel)]="selectedPeriod"
                        (onChange)="onPeriodChange()"
                        optionLabel="label"
                        optionValue="value"
                        [style]="{ 'min-width': '180px' }"
                    />
                </div> 
            </div>

            @if (loading) {
                <div class="flex flex-col gap-2">
                    @for (_ of [1, 2, 3, 4, 5]; track $index) {
                        <p-skeleton height="2.6rem" borderRadius="8px"></p-skeleton>
                    }
                </div>
            } @else if (errorMessage) {
                <div class="flex flex-col items-start gap-3 p-3 border-1 border-round surface-border">
                    <span class="text-sm text-red-500">{{ errorMessage }}</span>
                    <p-button label="Reessayer" icon="pi pi-refresh" size="small" (onClick)="loadData()" />
                </div>
            } @else if (rows.length === 0) {
                <div class="text-sm text-surface-500 p-3 border-1 border-round surface-border">
                    Aucune donnee disponible pour cette periode.
                </div>
            } @else {
                <p-table [value]="rows" [rows]="6">
                    <ng-template #header>
                        <tr>
                            <th>Statut</th>
                            <th>CA Total</th>
                            <th>Nb commandes</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-row>
                        <tr>
                            <td>
                                @let tag = getStatutTag(row.statut_facture);
                                <p-tag [value]="tag.value" [severity]="tag.severity"></p-tag>
                            </td>
                            <td>{{ row.ca_total | number:'1.0-0' }} GNF</td>
                            <td>{{ row.nb_commandes }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <div class="text-xs text-surface-500 mt-8 flex flex-wrap gap-2">
                    <span>Total CA (hors annulees): {{ totalCa | number:'1.0-0' }} GNF</span>
                    <span>-</span>
                    <span>Total commandes: {{ totalCommandes }}</span>
                </div>
                <div class="text-xs text-surface-500 mt-3">
                    Les factures annulees ({{ nbCommandesAnnulees }} commande(s)) ne sont pas prises en compte dans le CA.
                </div>
            }
        </div>
    `
})
export class caParStatutWidget implements OnInit {
    private readonly dashboardService = inject(DashboardService);
    private readonly statutOrder: VenteFactureStatus[] = ['payee', 'partiel', 'impayee', 'annulee'];

    readonly periodOptions: { label: string; value: VentesParTypePeriod }[] = [
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Cette semaine', value: 'this_week' },
        { label: 'Ce mois', value: 'this_month' },
        { label: 'Mois dernier', value: 'last_month' },
        { label: 'Cette annee', value: 'this_year' }
    ];

    selectedPeriod: VentesParTypePeriod = 'today';
    rows: StatutRow[] = [];
    loading = false;
    errorMessage: string | null = null;

    get totalCa(): number {
        return this.rows
            .filter((item) => item.statut_facture !== 'annulee')
            .reduce((sum, item) => sum + (item.ca_total ?? 0), 0);
    }

    get totalCommandes(): number {
        return this.rows.reduce((sum, item) => sum + (item.nb_commandes ?? 0), 0);
    }

    get nbCommandesAnnulees(): number {
        return this.rows
            .filter((item) => item.statut_facture === 'annulee')
            .reduce((sum, item) => sum + (item.nb_commandes ?? 0), 0);
    }

    ngOnInit(): void {
        this.loadData();
    }

    onPeriodChange(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.errorMessage = null;

        this.dashboardService
            .getVentesParTypeVehicule(this.selectedPeriod)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (data: DashboardVentesParTypeData) => {
                    this.rows = this.normalizeRows(data?.par_statut);
                },
                error: () => {
                    this.rows = [];
                    this.errorMessage = 'Impossible de charger le CA par statut.';
                }
            });
    }

    private normalizeRows(rows: StatutRow[] | undefined): StatutRow[] {
        const totals: Record<VenteFactureStatus, StatutRow> = {
            payee: { statut_facture: 'payee', ca_total: 0, nb_commandes: 0 },
            partiel: { statut_facture: 'partiel', ca_total: 0, nb_commandes: 0 },
            impayee: { statut_facture: 'impayee', ca_total: 0, nb_commandes: 0 },
            annulee: { statut_facture: 'annulee', ca_total: 0, nb_commandes: 0 }
        };

        for (const row of rows ?? []) {
            totals[row.statut_facture].ca_total += row.ca_total ?? 0;
            totals[row.statut_facture].nb_commandes += row.nb_commandes ?? 0;
        }

        return this.statutOrder.map((status) => totals[status]);
    }

    getStatutTag(statut: VenteFactureStatus): StatutTag {
        const map: Record<VenteFactureStatus, StatutTag> = {
            payee: { value: 'Payee', severity: 'success' },
            partiel: { value: 'Partielle', severity: 'warn' },
            impayee: { value: 'Impayee', severity: 'danger' },
            annulee: { value: 'Annulee', severity: 'secondary' }
        };
        return map[statut];
    }
}
