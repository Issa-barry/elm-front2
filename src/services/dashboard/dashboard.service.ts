import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UsineContextService } from '@/services/usine/usine-context.service';

export interface StatCard {
    value: number;
    delta_pct: number | null;
    trend: 'up' | 'down' | 'flat';
    sparkline: number[];
}

export interface VehiculeParType {
    type: string;
    label: string;
    count: number;
}

export type VentesParTypePeriod = 'today' | 'this_week' | 'this_month' | 'this_year' | 'last_month' | 'last_year';
export type VenteFactureStatus = 'impayee' | 'partiel' | 'payee' | 'annulee';
export type VentesEncaissementsPeriod =
    | 'today' | 'yesterday'
    | 'this_week' | 'last_week'
    | 'this_month' | 'last_month'
    | 'this_year' | 'last_year';
export type VentesEvolutionPeriod =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'last_week'
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'last_year'
    | 's1'
    | 's2'
    | 'q1'
    | 'q2'
    | 'q3'
    | 'q4';
export type VentesEvolutionStatutPeriod = VentesEvolutionPeriod | 'last_x_days';

export type VenteParType = {
    type_vehicule: string;
    label: string;
    statut_facture: VenteFactureStatus;
    ca_total: number;
    nb_commandes: number;
};

export type VenteParTypeResume = {
    type_vehicule: string;
    label: string;
    ca_total: number;
    nb_commandes: number;
};

export type StatutRow = {
    statut_facture: VenteFactureStatus;
    ca_total: number;
    nb_commandes: number;
};

export interface DashboardVentesParTypeData {
    period: { key: VentesParTypePeriod; from: string; to: string };
    lignes?: VenteParType[];
    par_type?: VenteParTypeResume[];
    par_statut?: StatutRow[];
}

export type EncaissementStat = {
    period: { key: string; from: string; to: string };
    total_factures: number;
    factures_payees: number;
    reste_a_encaisser: number;
    nb_factures_total: number;
    nb_factures_payees: number;
    nb_factures_impayees: number;
    nb_factures_annulees: number;
};

export type VentesEvolutionDataset = {
    type_vehicule: string;
    label: string;
    data: number[];
};

export interface DashboardVentesEvolutionData {
    period: { from: string; to: string; granularity: string };
    labels: string[];
    datasets: VentesEvolutionDataset[];
}

export interface DashboardVentesEvolutionStatutData {
    period: { key: string; from: string; to: string; granularity: string };
    labels: string[];
    datasets: Array<{ statut: string; label: string; data: number[] }>;
}

export interface DashboardStats {
    period: { key: string; from: string; to: string };
    prestataires: StatCard;
    packings: StatCard;
    utilisateurs: StatCard;
    vehicules: StatCard;
    rouleaux_stock: StatCard;
    vehicules_par_type: VehiculeParType[];
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

interface VentesParTypeApiResponse {
    data: DashboardVentesParTypeData;
}

interface EncaissementApiResponse {
    data: EncaissementStat;
}

interface VentesEvolutionApiResponse {
    data: DashboardVentesEvolutionData;
}

interface VentesEvolutionStatutApiResponse {
    data: DashboardVentesEvolutionStatutData;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly usineContext = inject(UsineContextService);
    private readonly baseUrl = `${environment.apiUrl}/dashboard`;

    getStats(period: string = 'this_month', days?: number): Observable<DashboardStats> {
        let params = new HttpParams().set('period', period);
        if (period === 'last_x_days' && days != null) {
            params = params.set('days', days.toString());
        }
        return this.http
            .get<ApiResponse>(`${this.baseUrl}/stats`, { params })
            .pipe(map((res) => res.data));
    }

    getVentesParTypeVehicule(period: VentesParTypePeriod = 'this_month'): Observable<DashboardVentesParTypeData> {
        const params = new HttpParams().set('period', period);
        const headers = this.getSiteHeaders();

        return this.http
            .get<VentesParTypeApiResponse>(`${this.baseUrl}/ventes/par-type-vehicule`, { params, headers })
            .pipe(map((res) => res.data));
    }

    getVentesEncaissements(period: VentesEncaissementsPeriod = 'this_month'): Observable<EncaissementStat> {
        const params = new HttpParams().set('period', period);
        const headers = this.getSiteHeaders();

        return this.http
            .get<EncaissementApiResponse>(`${this.baseUrl}/ventes/encaissements`, { params, headers })
            .pipe(map((res) => res.data));
    }

    getVentesEvolutionParType(period: VentesEvolutionPeriod = 'this_year'): Observable<DashboardVentesEvolutionData> {
        const params = new HttpParams().set('period', period);
        const headers = this.getSiteHeaders();

        return this.http
            .get<VentesEvolutionApiResponse>(`${this.baseUrl}/ventes/evolution-par-type`, { params, headers })
            .pipe(map((res) => res.data));
    }

    getVentesEvolutionParStatut(
        period: VentesEvolutionStatutPeriod = 'this_year',
        days?: number | null
    ): Observable<DashboardVentesEvolutionStatutData> {
        let params = new HttpParams().set('period', period);
        if (period === 'last_x_days' && days) {
            params = params.set('days', String(days));
        }

        const headers = this.getSiteHeaders();

        return this.http
            .get<VentesEvolutionStatutApiResponse>(`${this.baseUrl}/ventes/evolution-par-statut`, { params, headers })
            .pipe(map((res) => res.data));
    }

    private getSiteHeaders(): HttpHeaders | undefined {
        const siteHeaderValue = this.usineContext.headerUsineId();
        return siteHeaderValue !== null
            ? new HttpHeaders({ 'X-Site-Id': String(siteHeaderValue) })
            : undefined;
    }
}
