import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  FactureVente,
  EncaissementVente,
  StoreEncaissementVenteDto,
  StatutFacture,
} from '@/models/vente.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedData<T> {
  data: T[];
  links: any;
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

@Injectable({ providedIn: 'root' })
export class FactureLivraisonService {
  private readonly facturesUrl = `${environment.apiUrl}/ventes/factures`;
  private readonly encaissementsUrl = `${environment.apiUrl}/ventes/encaissements`;

  constructor(private http: HttpClient) {}

  // ── Factures ──────────────────────────────────────────────────────────

  getFactures(params?: {
    statut?: StatutFacture;
    vehicule_id?: number;
  }): Observable<ApiResponse<PaginatedData<FactureVente>>> {
    let httpParams = new HttpParams();
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.vehicule_id) httpParams = httpParams.set('vehicule_id', String(params.vehicule_id));
    return this.http.get<ApiResponse<PaginatedData<FactureVente>>>(this.facturesUrl, {
      params: httpParams,
    });
  }

  getFacture(id: number): Observable<ApiResponse<FactureVente>> {
    return this.http.get<ApiResponse<FactureVente>>(`${this.facturesUrl}/${id}`);
  }

  annulerFacture(id: number): Observable<ApiResponse<FactureVente>> {
    return this.http.post<ApiResponse<FactureVente>>(`${this.facturesUrl}/${id}/annuler`, {});
  }

  // ── Encaissements ─────────────────────────────────────────────────────

  getEncaissements(params?: {
    facture_vente_id?: number;
  }): Observable<ApiResponse<PaginatedData<EncaissementVente>>> {
    let httpParams = new HttpParams();
    if (params?.facture_vente_id)
      httpParams = httpParams.set('facture_vente_id', String(params.facture_vente_id));
    return this.http.get<ApiResponse<PaginatedData<EncaissementVente>>>(this.encaissementsUrl, {
      params: httpParams,
    });
  }

  createEncaissement(
    data: StoreEncaissementVenteDto
  ): Observable<ApiResponse<EncaissementVente>> {
    return this.http.post<ApiResponse<EncaissementVente>>(this.encaissementsUrl, data);
  }
}
