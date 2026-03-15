import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Livreur } from '@/models/vehicule.model';

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

export interface StoreLivreurData {
  nom: string;
  prenom: string;
  phone: string;
  is_active?: boolean;
}

export interface UpdateLivreurData extends Partial<StoreLivreurData> {}

@Injectable({ providedIn: 'root' })
export class LivreurService {
  private readonly baseUrl = `${environment.apiUrl}/livreurs`;

  constructor(private http: HttpClient) {}

  getAll(statut?: 'actif' | 'inactif'): Observable<ApiResponse<PaginatedData<Livreur>>> {
    if (statut) {
      return this.http.get<ApiResponse<PaginatedData<Livreur>>>(this.baseUrl, { params: { statut } });
    }
    return this.http.get<ApiResponse<PaginatedData<Livreur>>>(this.baseUrl);
  }

  getOne(id: number): Observable<ApiResponse<Livreur>> {
    return this.http.get<ApiResponse<Livreur>>(`${this.baseUrl}/${id}`);
  }

  create(data: StoreLivreurData): Observable<ApiResponse<Livreur>> {
    return this.http.post<ApiResponse<Livreur>>(this.baseUrl, data);
  }

  update(id: number, data: UpdateLivreurData): Observable<ApiResponse<Livreur>> {
    return this.http.put<ApiResponse<Livreur>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
