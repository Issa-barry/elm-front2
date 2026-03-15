import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from '@/models/user.model';
import { ApiResponse, AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/models/auth.model';
import { MeResponse } from '@/models/usine.model';
import { UsineContextService } from '@/services/usine/usine-context.service';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http         = inject(HttpClient);
  private router       = inject(Router);
  private usineContext = inject(UsineContextService);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  // Signals pour gérer l'état
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(this.hasToken());

  // BehaviorSubject pour compatibilité avec les observables
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialiser l'état au démarrage
    this.initializeAuth();
  } 

  /**
   * Initialiser l'authentification au démarrage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();

    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.currentUserSubject.next(user);
      this.refreshCurrentUserProfile();
    } else {
      this.clearAuth();
    }
  }

  /**
   * Inscription
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Connexion
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Déconnexion
   */ 
  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        // Même en cas d'erreur, on déconnecte l'utilisateur localement
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return this.handleError(error);
      })
    ); 
  }

  /**
   * Déconnexion de tous les appareils
   */
  logoutAll(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/logout-all`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtenir le profil de l'utilisateur connecté.
   * La réponse /auth/me retourne un MeResponse enrichi (usines, rôles, permissions).
   * On hydrate le store usine après chaque appel réussi.
   */
  me(): Observable<ApiResponse<MeResponse>> {
    return this.http.get<ApiResponse<MeResponse>>(`${this.API_URL}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Extraire et persister le User (conserve la logique existante)
          const user = this.extractUserFromPayload(response.data);
          if (user) {
            this.setUser(user);
          }
          // Hydrater le contexte usine avec les données multi-usine
          this.usineContext.hydrateFromMe(response.data);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/profile`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setUser(response.data);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(data: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/change-password`, data).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    return this.http.post<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>>(
      `${this.API_URL}/refresh-token`,
      {}
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setToken(response.data.access_token);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Vérifier la validité du token
   */
  checkToken(): Observable<ApiResponse<{ valid: boolean; user: User }>> {
    return this.http.get<ApiResponse<{ valid: boolean; user: User }>>(`${this.API_URL}/check-token`).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this.setUser(response.data.user);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /** 
   * Gérer le succès de l'authentification
   */
  private handleAuthSuccess(data: { user: User; access_token: string }): void {
    this.setToken(data.access_token);
    const user = this.extractUserFromPayload(data) ?? data.user;
    this.setUser(user);
    this.refreshCurrentUserProfile();
  }

  /**
   * Sauvegarder le token
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérifier si un token existe
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Sauvegarder l'utilisateur
   */
  private setUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Récupérer l'utilisateur depuis le storage
   */
  private getUserFromStorage(): User | null {
    const userJson = sessionStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }

    try {
      const parsed = JSON.parse(userJson);
      return this.extractUserFromPayload(parsed);
    } catch {
      return null;
    }
  }

  private refreshCurrentUserProfile(): void {
    this.me().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  private extractUserFromPayload(payload: any): User | null {
    const source = payload?.user ?? payload;
    if (!source || typeof source !== 'object') {
      return null;
    }

    const user = { ...source } as User;

    const permissions = this.mergeUniqueStrings(
      this.normalizePermissions(source?.permissions),
      this.normalizePermissions(payload?.permissions)
    );
    if (permissions.length > 0) {
      user.permissions = permissions;
    }

    const roles = this.mergeUniqueStrings(
      this.normalizeStringList(source?.roles),
      this.normalizeStringList(source?.role_names),
      this.normalizeStringList(payload?.roles),
      this.normalizeStringList(payload?.role_names)
    );
    if (roles.length > 0) {
      user.roles = roles;
      user.role_names = roles;
    }

    return user;
  }

  private normalizeStringList(value: any): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (item && typeof item === 'object' && typeof item.name === 'string') {
          return item.name.trim();
        }

        return '';
      })
      .filter((item) => item.length > 0);
  }

  private normalizePermissions(value: any): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') {
            return item.trim();
          }

          if (item && typeof item === 'object' && typeof item.name === 'string') {
            return item.name.trim();
          }

          return '';
        })
        .filter((item) => item.length > 0);
    }

    if (typeof value === 'object') {
      return Object.entries(value).flatMap(([module, actions]) => {
        if (Array.isArray(actions)) {
          return actions
            .filter((action) => typeof action === 'string' && action.trim().length > 0)
            .map((action) => `${module}.${action.trim()}`);
        }

        if (actions && typeof actions === 'object') {
          return Object.entries(actions)
            .filter(([, enabled]) => !!enabled)
            .map(([action]) => `${module}.${action}`);
        }

        if (typeof actions === 'string' && actions.trim().length > 0) {
          return [`${module}.${actions.trim()}`];
        }

        return [];
      });
    }

    return [];
  }

  private mergeUniqueStrings(...arrays: string[][]): string[] {
    const set = new Set<string>();
    arrays.flat().forEach((item) => {
      const value = item.trim();
      if (value.length > 0) {
        set.add(value);
      }
    });
    return Array.from(set);
  }

  /**
   * Nettoyer toutes les données d'authentification (y compris contexte usine)
   */
  private clearAuth(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.currentUserSubject.next(null);
    this.usineContext.clear();
  }

  /**
   * Gérer les erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur API:', error);

    // Si erreur 401, vider l'état local (la navigation vers /auth/login est gérée par authInterceptor)
    if (error.status === 401) {
      this.clearAuth();
    }

    return throwError(() => error);
  }

  /**
 * Vérifier si l'utilisateur est connecté
 */
  isLoggedIn(): boolean {
    return this.hasToken() && this.currentUser() !== null;
  }

  /**
   * Vérifier si l'utilisateur possède une permission
   */
  hasPermission(permission: string): boolean {
    return this.hasAnyPermission([permission]);
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    if (requiredPermissions.length === 0) return true;

    const user = this.currentUser();
    if (!user) return false;

    if (this.hasAnyRole(['super_admin', 'super-admin'])) {
      return true;
    }

    const permissions = user.permissions ?? [];
    if (permissions.length === 0) return false;

    const normalizedCurrent = new Set(
      permissions.map((permission) => this.normalizePermission(permission)).filter((permission) => permission.length > 0)
    );

    return requiredPermissions.some((permission) => normalizedCurrent.has(this.normalizePermission(permission)));
  }

  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    if (requiredRoles.length === 0) return true;

    const user = this.currentUser();
    if (!user) return false;

    const currentRoles = new Set(
      [...(user.roles ?? []), ...(user.role_names ?? [])]
        .map((roleItem) => this.normalizeRole(roleItem))
        .filter((roleItem) => roleItem.length > 0)
    );

    return requiredRoles.some((roleItem) => currentRoles.has(this.normalizeRole(roleItem)));
  }

  private normalizeRole(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private normalizePermission(value: string): string {
    return value.trim().toLowerCase();
  }
}
