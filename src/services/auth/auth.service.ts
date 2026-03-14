import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from '@/models/user.model';
import {
    ApiResponse,
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
} from '@/models/auth.model';
import { MeResponse } from '@/models/usine.model';
import { UsineContextService } from '@/services/usine/usine-context.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http         = inject(HttpClient);
    private router       = inject(Router);
    private usineContext = inject(UsineContextService);

    private readonly API_URL   = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'access_token';
    private readonly USER_KEY  = 'user';

    currentUser      = signal<User | null>(this.getUserFromStorage());
    isAuthenticated  = signal<boolean>(this.hasToken());

    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    public currentUser$        = this.currentUserSubject.asObservable();

    constructor() {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const token = this.getToken();
        const user  = this.getUserFromStorage();

        if (token && user) {
            this.currentUser.set(user);
            this.isAuthenticated.set(true);
            this.currentUserSubject.next(user);
            this.refreshCurrentUserProfile();
        } else {
            this.clearAuth();
        }
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
            tap(response => { if (response.success && response.data) this.handleAuthSuccess(response.data); }),
            catchError(error => this.handleError(error))
        );
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => { if (response.success && response.data) this.handleAuthSuccess(response.data); }),
            catchError(error => this.handleError(error))
        );
    }

    logout(): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.API_URL}/logout`, {}).pipe(
            tap(() => { this.clearAuth(); this.router.navigate(['/auth/login']); }),
            catchError(error => {
                this.clearAuth();
                this.router.navigate(['/auth/login']);
                return this.handleError(error);
            })
        );
    }

    me(): Observable<ApiResponse<MeResponse>> {
        return this.http.get<ApiResponse<MeResponse>>(`${this.API_URL}/me`).pipe(
            tap(response => {
                if (response.success && response.data) {
                    const user = this.extractUserFromPayload(response.data);
                    if (user) this.setUser(user);
                    this.usineContext.hydrateFromMe(response.data);
                }
            }),
            catchError(error => this.handleError(error))
        );
    }

    updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.API_URL}/profile`, data).pipe(
            tap(response => { if (response.success && response.data) this.setUser(response.data); }),
            catchError(error => this.handleError(error))
        );
    }

    changePassword(data: ChangePasswordRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.API_URL}/change-password`, data).pipe(
            catchError(error => this.handleError(error))
        );
    }

    refreshToken(): Observable<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
        return this.http
            .post<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>>(
                `${this.API_URL}/refresh-token`, {}
            )
            .pipe(
                tap(response => { if (response.success && response.data) this.setToken(response.data.access_token); }),
                catchError(error => this.handleError(error))
            );
    }

    private handleAuthSuccess(data: { user: User; access_token: string }): void {
        this.setToken(data.access_token);
        const user = this.extractUserFromPayload(data) ?? data.user;
        this.setUser(user);
        this.refreshCurrentUserProfile();
    }

    setToken(token: string): void {
        sessionStorage.setItem(this.TOKEN_KEY, token);
    }

    getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    hasToken(): boolean {
        return !!this.getToken();
    }

    private setUser(user: User): void {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.currentUserSubject.next(user);
    }

    private getUserFromStorage(): User | null {
        const userJson = sessionStorage.getItem(this.USER_KEY);
        if (!userJson) return null;
        try {
            return this.extractUserFromPayload(JSON.parse(userJson));
        } catch {
            return null;
        }
    }

    private refreshCurrentUserProfile(): void {
        this.me().subscribe({ next: () => {}, error: () => {} });
    }

    private extractUserFromPayload(payload: any): User | null {
        const source = payload?.user ?? payload;
        if (!source || typeof source !== 'object') return null;

        const user = { ...source } as User;

        const permissions = this.mergeUniqueStrings(
            this.normalizePermissions(source?.permissions),
            this.normalizePermissions(payload?.permissions)
        );
        if (permissions.length > 0) user.permissions = permissions;

        const roles = this.mergeUniqueStrings(
            this.normalizeStringList(source?.roles),
            this.normalizeStringList(source?.role_names),
            this.normalizeStringList(payload?.roles),
            this.normalizeStringList(payload?.role_names)
        );
        if (roles.length > 0) { user.roles = roles; user.role_names = roles; }

        return user;
    }

    private normalizeStringList(value: any): string[] {
        if (!Array.isArray(value)) return [];
        return value
            .map(item => (typeof item === 'string' ? item.trim() : item?.name?.trim() ?? ''))
            .filter(item => item.length > 0);
    }

    private normalizePermissions(value: any): string[] {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value
                .map(item => (typeof item === 'string' ? item.trim() : item?.name?.trim() ?? ''))
                .filter(item => item.length > 0);
        }
        if (typeof value === 'object') {
            return Object.entries(value).flatMap(([module, actions]) => {
                if (Array.isArray(actions))
                    return (actions as string[]).filter(a => typeof a === 'string' && a.trim()).map(a => `${module}.${a.trim()}`);
                if (actions && typeof actions === 'object')
                    return Object.entries(actions).filter(([, enabled]) => !!enabled).map(([action]) => `${module}.${action}`);
                if (typeof actions === 'string' && actions.trim())
                    return [`${module}.${actions.trim()}`];
                return [];
            });
        }
        return [];
    }

    private mergeUniqueStrings(...arrays: string[][]): string[] {
        const set = new Set<string>();
        arrays.flat().forEach(item => { const v = item.trim(); if (v) set.add(v); });
        return Array.from(set);
    }

    clearAuth(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.currentUserSubject.next(null);
        this.usineContext.clear();
    }

    private handleError(error: any): Observable<never> {
        console.error('Erreur API:', error);
        if (error.status === 401) this.clearAuth();
        return throwError(() => error);
    }

    isLoggedIn(): boolean {
        return this.hasToken() && this.currentUser() !== null;
    }

    hasPermission(permission: string): boolean {
        return this.hasAnyPermission([permission]);
    }

    hasAnyPermission(required: string[]): boolean {
        if (!required.length) return true;
        const user = this.currentUser();
        if (!user) return false;
        if (this.hasAnyRole(['super_admin', 'super-admin'])) return true;
        const perms = user.permissions ?? [];
        if (!perms.length) return false;
        const current = new Set(perms.map(p => this.normalizePermission(p)).filter(p => p.length > 0));
        return required.some(p => current.has(this.normalizePermission(p)));
    }

    hasRole(role: string): boolean { return this.hasAnyRole([role]); }

    hasAnyRole(required: string[]): boolean {
        if (!required.length) return true;
        const user = this.currentUser();
        if (!user) return false;
        const current = new Set(
            [...(user.roles ?? []), ...(user.role_names ?? [])]
                .map(r => this.normalizeRole(r))
                .filter(r => r.length > 0)
        );
        return required.some(r => current.has(this.normalizeRole(r)));
    }

    private normalizeRole(value: string): string {
        return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    private normalizePermission(value: string): string {
        return value.trim().toLowerCase();
    }
}
