import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Forfait, ForfaitPayload } from '@/models/forfait.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ForfaitService {
  private readonly http    = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/billing/forfaits`;

  getAll(): Observable<Forfait[]> {
    return this.http
      .get<ApiResponse<Forfait[]>>(this.apiBase)
      .pipe(map((r) => r.data));
  }

  create(dto: ForfaitPayload): Observable<Forfait> {
    return this.http
      .post<ApiResponse<Forfait>>(this.apiBase, dto)
      .pipe(map((r) => r.data));
  }

  update(id: number, dto: Partial<ForfaitPayload>): Observable<Forfait> {
    return this.http
      .put<ApiResponse<Forfait>>(`${this.apiBase}/${id}`, dto)
      .pipe(map((r) => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiBase}/${id}`);
  }
}
