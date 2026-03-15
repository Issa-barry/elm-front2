import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Vehicule, VehiculeFilters } from '@/models/vehicule.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  private readonly baseUrl = `${environment.apiUrl}/vehicules`;

  constructor(private http: HttpClient) {}

  getAll(filters?: VehiculeFilters): Observable<ApiResponse<PaginatedData<Vehicule>>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.per_page) params = params.set('per_page', String(filters.per_page));
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (params.keys().length > 0) {
      return this.http.get<ApiResponse<PaginatedData<Vehicule>>>(this.baseUrl, { params });
    }
    return this.http.get<ApiResponse<PaginatedData<Vehicule>>>(this.baseUrl);
  }

  getOne(id: number): Observable<ApiResponse<Vehicule>> {
    return this.http.get<ApiResponse<Vehicule>>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<ApiResponse<Vehicule>> {
    return this.http.post<ApiResponse<Vehicule>>(this.baseUrl, formData);
  }

  update(id: number, formData: FormData): Observable<ApiResponse<Vehicule>> {
    return this.http.post<ApiResponse<Vehicule>>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
