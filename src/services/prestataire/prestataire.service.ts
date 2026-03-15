import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
 import { Prestataire, CreatePrestataireDto, UpdatePrestataireDto } from '@/models/prestataire.model';
import { environment } from 'src/environments/environment';

// Interfaces pour les réponses API
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

// Interface pour les filtres
export interface PrestataireFilters {
  is_active?: boolean;
  search?: string;
  pays?: string;
  ville?: string;
  specialite?: string;
  sort_by?: 'nom' | 'prenom' | 'email' | 'created_at' | 'tarif_horaire';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PrestataireService {
  private readonly apiUrl = `${environment.apiUrl}/prestataires`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste des prestataires avec filtres optionnels
   */
  getPrestataires(filters?: PrestataireFilters): Observable<ApiResponse<Prestataire[]> | PaginatedResponse<Prestataire>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.is_active !== undefined) {
        params = params.set('is_active', filters.is_active.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.pays) {
        params = params.set('pays', filters.pays);
      }
      if (filters.ville) {
        params = params.set('ville', filters.ville);
      }
      if (filters.specialite) {
        params = params.set('specialite', filters.specialite);
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
      if (filters.per_page) {
        params = params.set('per_page', filters.per_page.toString());
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
    }

    return this.http.get<ApiResponse<Prestataire[]> | PaginatedResponse<Prestataire>>(this.apiUrl, { params });
  }

  /**
   * Récupérer un prestataire par son ID
   */
  getPrestataire(id: number): Observable<ApiResponse<Prestataire>> {
    return this.http.get<ApiResponse<Prestataire>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau prestataire
   */
  createPrestataire(data: CreatePrestataireDto): Observable<ApiResponse<Prestataire>> {
    return this.http.post<ApiResponse<Prestataire>>(this.apiUrl, data);
  }

  /**
   * Mettre à jour un prestataire
   */
  updatePrestataire(id: number, data: UpdatePrestataireDto): Observable<ApiResponse<Prestataire>> {
    return this.http.put<ApiResponse<Prestataire>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Basculer le statut actif/inactif d'un prestataire
   */
  togglePrestataireStatus(id: number): Observable<ApiResponse<Prestataire>> {
    return this.http.patch<ApiResponse<Prestataire>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Supprimer un prestataire (soft delete)
   */
  deletePrestataire(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Restaurer un prestataire supprimé
   */
  restorePrestataire(id: number): Observable<ApiResponse<Prestataire>> {
    return this.http.post<ApiResponse<Prestataire>>(`${this.apiUrl}/${id}/restore`, {});
  }

  /**
   * Rechercher des prestataires
   * Recherche dans: nom, prenom, email, phone, reference, raison_sociale
   */
  searchPrestataires(searchTerm: string): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir uniquement les prestataires actifs
   */
  getActivePrestataires(): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('is_active', 'true');
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les prestataires inactifs
   */
  getInactivePrestataires(): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('is_active', 'false');
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les prestataires par pays
   */
  getPrestatairesByCountry(country: string): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('pays', country);
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les prestataires par ville
   */
  getPrestatairesByCity(city: string): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('ville', city);
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les prestataires par spécialité
   */
  getPrestatairesBySpecialite(specialite: string): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams().set('specialite', specialite);
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les prestataires avec pagination
   */
  getPrestatairesPaginated(
    page: number = 1, 
    perPage: number = 10, 
    filters?: Omit<PrestataireFilters, 'page' | 'per_page'>
  ): Observable<PaginatedResponse<Prestataire>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters) {
      if (filters.is_active !== undefined) {
        params = params.set('is_active', filters.is_active.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.pays) {
        params = params.set('pays', filters.pays);
      }
      if (filters.ville) {
        params = params.set('ville', filters.ville);
      }
      if (filters.specialite) {
        params = params.set('specialite', filters.specialite);
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }
    
    return this.http.get<PaginatedResponse<Prestataire>>(this.apiUrl, { params });
  }

  /**
   * Trier les prestataires
   */
  sortPrestataires(
    sortBy: PrestataireFilters['sort_by'], 
    sortOrder: PrestataireFilters['sort_order'] = 'asc'
  ): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams()
      .set('sort_by', sortBy || 'created_at')
      .set('sort_order', sortOrder);
    
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les statistiques des prestataires
   */
  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`);
  }

  /**
   * Obtenir les prestataires avec tarif horaire dans une fourchette
   */
  getPrestatairesByTarifRange(min: number, max: number): Observable<ApiResponse<Prestataire[]>> {
    const params = new HttpParams()
      .set('tarif_min', min.toString())
      .set('tarif_max', max.toString());
    
    return this.http.get<ApiResponse<Prestataire[]>>(this.apiUrl, { params });
  }
}