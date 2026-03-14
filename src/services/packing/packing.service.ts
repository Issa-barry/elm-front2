import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Packing,
  CreatePackingDto,
  UpdatePackingDto,
  PackingFilters,
  ChangePackingStatutDto,
  StoreVersementDto,
  VersementIndexResponse,
  Versement,
} from '@/models/packing.model';
import { environment } from 'src/environments/environment';

export interface PackingStats {
  period: string;
  labels: string[];
  payee: number[];
  impayee: number[];
  partielle?: number[];
  partiellement_payee?: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PackingService {
  private readonly apiUrl = `${environment.apiUrl}/packings`;

  constructor(private http: HttpClient) {}

  getPackings(filters?: PackingFilters): Observable<ApiResponse<Packing[]> | PaginatedResponse<Packing>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.prestataire_id) params = params.set('prestataire_id', filters.prestataire_id.toString());
      if (filters.statut) params = params.set('statut', filters.statut);
      if (filters.date_debut) params = params.set('date_debut', filters.date_debut);
      if (filters.date_fin) params = params.set('date_fin', filters.date_fin);
      if (filters.non_payes) params = params.set('non_payes', filters.non_payes.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
      if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
    }

    return this.http.get<ApiResponse<Packing[]> | PaginatedResponse<Packing>>(this.apiUrl, { params });
  }

  getPacking(id: number): Observable<ApiResponse<Packing>> {
    return this.http.get<ApiResponse<Packing>>(`${this.apiUrl}/${id}`);
  }

  createPacking(data: CreatePackingDto): Observable<ApiResponse<Packing>> {
    return this.http.post<ApiResponse<Packing>>(this.apiUrl, data);
  }

  updatePacking(id: number, data: UpdatePackingDto): Observable<ApiResponse<Packing>> {
    return this.http.put<ApiResponse<Packing>>(`${this.apiUrl}/${id}`, data);
  }

  changeStatut(id: number, data: ChangePackingStatutDto): Observable<ApiResponse<Packing>> {
    return this.http.patch<ApiResponse<Packing>>(`${this.apiUrl}/${id}/statut`, data);
  }

  deletePacking(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  // ========================= Versements =========================

  getVersements(packingId: number): Observable<ApiResponse<VersementIndexResponse>> {
    return this.http.get<ApiResponse<VersementIndexResponse>>(`${this.apiUrl}/${packingId}/versements`);
  }

  createVersement(
    packingId: number,
    data: StoreVersementDto,
  ): Observable<ApiResponse<{ versement: Versement; packing: Packing }>> {
    return this.http.post<ApiResponse<{ versement: Versement; packing: Packing }>>(
      `${this.apiUrl}/${packingId}/versements`,
      data,
    );
  }

  deleteVersement(packingId: number, versementId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${packingId}/versements/${versementId}`);
  }

  getStats(period: string = 'this_week'): Observable<ApiResponse<PackingStats>> {
    return this.http.get<ApiResponse<PackingStats>>(`${this.apiUrl}/stats`, {
      params: { period },
    });
  }
}
