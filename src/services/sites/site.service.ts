import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '@/models/auth.model';
import { CreateSiteDto, Site, UpdateSiteDto } from '@/models/usine.model';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/sites`;

  getAll(): Observable<Site[]> {
    return this.http
      .get<ApiResponse<unknown>>(this.apiBase)
      .pipe(map((response) => this.normalizeCollection<Site>(response.data)));
  }

  getById(id: number): Observable<Site> {
    return this.http
      .get<ApiResponse<unknown>>(`${this.apiBase}/${id}`)
      .pipe(map((response) => this.normalizeItem<Site>(response.data)));
  }

  create(payload: CreateSiteDto): Observable<Site> {
    return this.http
      .post<ApiResponse<unknown>>(this.apiBase, payload)
      .pipe(map((response) => this.normalizeItem<Site>(response.data)));
  }

  update(id: number, payload: UpdateSiteDto): Observable<Site> {
    return this.http
      .patch<ApiResponse<unknown>>(`${this.apiBase}/${id}`, payload)
      .pipe(map((response) => this.normalizeItem<Site>(response.data)));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.apiBase}/${id}`)
      .pipe(map(() => void 0));
  }

  setDefault(id: number): Observable<void> {
    return this.http
      .patch<ApiResponse<unknown>>(`${this.apiBase}/${id}/set-default`, {})
      .pipe(map(() => void 0));
  }

  private normalizeCollection<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) {
      return payload as T[];
    }

    if (payload && typeof payload === 'object') {
      const data = (payload as { data?: unknown }).data;
      if (Array.isArray(data)) {
        return data as T[];
      }
    }

    return [];
  }

  private normalizeItem<T>(payload: unknown): T {
    if (payload && typeof payload === 'object') {
      const data = (payload as { data?: unknown }).data;
      if (data && typeof data === 'object') {
        return data as T;
      }
      return payload as T;
    }

    throw new Error('Reponse API invalide');
  }
}
