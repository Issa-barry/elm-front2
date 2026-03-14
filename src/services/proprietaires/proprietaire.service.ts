import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Proprietaire } from '@/models/vehicule.model';

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

export interface StoreProprietaireData {
  nom: string;
  prenom: string;
  phone: string;
  email?: string;
  pays: string;
  ville: string;
  quartier: string;
  is_active?: boolean;
}

export interface UpdateProprietaireData extends Partial<StoreProprietaireData> {}

@Injectable({ providedIn: 'root' })
export class ProprietaireService {
  private readonly baseUrl = `${environment.apiUrl}/proprietaires`;

  constructor(private http: HttpClient) {}

  getAll(statut?: 'actif' | 'inactif'): Observable<ApiResponse<PaginatedData<Proprietaire>>> {
    if (statut) {
      return this.http.get<ApiResponse<PaginatedData<Proprietaire>>>(this.baseUrl, { params: { statut } });
    }
    return this.http.get<ApiResponse<PaginatedData<Proprietaire>>>(this.baseUrl);
  }

  getOne(id: number): Observable<ApiResponse<Proprietaire>> {
    return this.http.get<ApiResponse<Proprietaire>>(`${this.baseUrl}/${id}`);
  }

  create(data: StoreProprietaireData): Observable<ApiResponse<Proprietaire>> {
    return this.http.post<ApiResponse<Proprietaire>>(this.baseUrl, data);
  }

  update(id: number, data: UpdateProprietaireData): Observable<ApiResponse<Proprietaire>> {
    return this.http.put<ApiResponse<Proprietaire>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
