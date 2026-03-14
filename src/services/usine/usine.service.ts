import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '@/models/auth.model';
import {
  AssignUserToUsineDto,
  CreateUsineDto,
  Usine,
  UpdateUsineDto,
} from '@/models/usine.model';

/**
 * Service HTTP pour tous les endpoints /sites.
 *
 * Endpoints (source : contrat API backend) :
 *   GET    /sites
 *   POST   /sites                       (siege uniquement)
 *   PATCH  /sites/{id}                  (siege uniquement)
 *   PATCH  /sites/{id}/set-default
 *   POST   /sites/{siteId}/users        (siege uniquement)
 *   DELETE /sites/{siteId}/users/{userId} (siege uniquement)
 */
@Injectable({ providedIn: 'root' })
export class UsineService {
  private readonly http    = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/sites`;

  /** RÃ©cupÃ©rer toutes les usines accessibles */
  getAll(): Observable<ApiResponse<Usine[]>> {
    return this.http.get<ApiResponse<Usine[]>>(this.apiBase);
  }

  getById(id: number): Observable<ApiResponse<Usine>> {
    return this.http.get<ApiResponse<Usine>>(`${this.apiBase}/${id}`);
  }

  /** CrÃ©er une usine (siÃ¨ge uniquement) */
  create(dto: CreateUsineDto): Observable<ApiResponse<Usine>> {
    return this.http.post<ApiResponse<Usine>>(this.apiBase, dto);
  }

  /** Mettre Ã  jour une usine (siÃ¨ge uniquement) */
  update(id: number, dto: UpdateUsineDto): Observable<ApiResponse<Usine>> {
    return this.http.patch<ApiResponse<Usine>>(`${this.apiBase}/${id}`, dto);
  }

  /** DÃ©finir l'usine par dÃ©faut pour l'utilisateur courant */
  setDefault(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiBase}/${id}/set-default`, {});
  }

  /** Assigner un utilisateur Ã  une usine (siÃ¨ge uniquement) */
  assignUser(usineId: number, dto: AssignUserToUsineDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiBase}/${usineId}/users`, dto);
  }

  /** Retirer un utilisateur d'une usine (siÃ¨ge uniquement) */
  removeUser(usineId: number, userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiBase}/${usineId}/users/${userId}`
    );
  }
}

