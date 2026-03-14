import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, Civilite, PieceType, UserType } from '@/models/user.model';
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
export interface UserFilters {
  is_active?: boolean;
  search?: string;
  pays?: string;
  ville?: string;
  sort_by?: 'nom' | 'prenom' | 'email' | 'created_at' | 'last_login_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Interfaces pour la vérification du téléphone
export interface CheckPhoneRequest {
  phone: string;
  code_phone_pays: string;
}

export interface CheckPhoneResponse {
  available: boolean;
  normalized_phone?: string;
}

// Interface pour la mise à jour
export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  phone?: string;
  email?: string | null;
  pays?: string;
  code_pays?: string;
  code_phone_pays?: string;
  ville?: string;
  quartier?: string;
  type?: UserType;
  role?: string;
  civilite?: Civilite | null;
  date_naissance?: string | null;
  piece_type?: PieceType | null;
  piece_numero?: string | null;
  piece_delivree_le?: string | null;
  piece_expire_le?: string | null;
  piece_pays?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un nouvel utilisateur (via le endpoint register).
   * Utilisé par la page d'inscription publique (/auth/register).
   */
  createUser(data: CreateUserDto): Observable<ApiResponse<{ user: User; access_token: string }>> {
    return this.http.post<ApiResponse<{ user: User; access_token: string }>>(`${this.authUrl}/register`, data);
  }

  /**
   * Créer un utilisateur via l'API métier (POST /users).
   * À combiner avec UsineService.assignUser pour l'assignation à l'usine courante.
   */
  createUserViaApi(data: CreateUserDto): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, data);
  }

  /**
   * Récupérer la liste des utilisateurs avec filtres optionnels
   */
  getUsers(filters?: UserFilters): Observable<ApiResponse<User[]> | PaginatedResponse<User>> {
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

    return this.http.get<ApiResponse<User[]> | PaginatedResponse<User>>(this.apiUrl, { params });
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(id: number, data: UpdateUserDto): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Basculer le statut actif/inactif d'un utilisateur
   */
  toggleUserStatus(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Archiver un utilisateur (désactivation définitive)
   */
  archiveUser(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/archiver`, {});
  }

  /**
   * Supprimer un utilisateur (soft delete)
   */
  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Rechercher des utilisateurs
   * Recherche dans: nom, prenom, email, phone, reference
   */
  searchUsers(searchTerm: string): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir uniquement les utilisateurs actifs
   */
  getActiveUsers(): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('is_active', 'true');
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les utilisateurs inactifs
   */
  getInactiveUsers(): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('is_active', 'false');
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les utilisateurs par pays
   */
  getUsersByCountry(country: string): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('pays', country);
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les utilisateurs par ville
   */
  getUsersByCity(city: string): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('ville', city);
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  /**
   * Obtenir les utilisateurs avec pagination
   */
  getUsersPaginated(page: number = 1, perPage: number = 10, filters?: Omit<UserFilters, 'page' | 'per_page'>): Observable<PaginatedResponse<User>> {
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
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }
    
    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

  /**
   * Vérifier si un numéro de téléphone est disponible (non utilisé par un autre compte).
   * À appeler en mode création avant de passer à l'étape 2 du stepper.
   */
  checkPhone(data: CheckPhoneRequest): Observable<ApiResponse<CheckPhoneResponse>> {
    return this.http.post<ApiResponse<CheckPhoneResponse>>(`${this.apiUrl}/check-phone`, data);
  }

  /**
   * Trier les utilisateurs
   */
  sortUsers(sortBy: UserFilters['sort_by'], sortOrder: UserFilters['sort_order'] = 'asc'): Observable<ApiResponse<User[]>> {
    const params = new HttpParams()
      .set('sort_by', sortBy || 'created_at')
      .set('sort_order', sortOrder);
    
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }
}