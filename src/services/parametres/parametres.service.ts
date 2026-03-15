import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Parametre, UpdateParametreDto } from '@/models/parametres.model';
import { environment } from 'src/environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ParametresListResponse {
  parametres: Parametre[];
  groupes: Record<string, string>;
}

@Injectable({ 
  providedIn: 'root',
})
export class ParametresService {
  private readonly apiUrl = `${environment.apiUrl}/parametres`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les paramètres (avec filtre optionnel par groupe)
   */
  getParametres(groupe?: string): Observable<ApiResponse<ParametresListResponse>> {
    let params = new HttpParams();
    if (groupe) {
      params = params.set('groupe', groupe);
    }
    return this.http.get<ApiResponse<ParametresListResponse>>(this.apiUrl, { params });
  }

  /**
   * Mettre à jour un paramètre
   */
  updateParametre(id: number, data: UpdateParametreDto): Observable<ApiResponse<Parametre>> {
    return this.http.put<ApiResponse<Parametre>>(`${this.apiUrl}/${id}`, data);
  }
 
  /**
   * Récupérer les périodes disponibles pour un mois/année
   */
  getPrixRouleauDefaut(): Observable<number> {
    return this.getParametres('packing').pipe(
      map((response) => {
        const parametre = response.data.parametres.find((p) => p.cle === 'prix_rouleau_defaut');
        if (!parametre) return 0;
        const valeur = Number(parametre.valeur);
        return Number.isFinite(valeur) ? valeur : 0;
      })
    );
  }
}
