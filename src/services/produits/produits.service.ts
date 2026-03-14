import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  ChangeStatusDto,
  CreateProduitDto,
  Produit,
  ProduitSearchParams,
  ProduitStatistics,
  ProduitStatut,
  ProduitType,
  UpdateStockDto,
  UpdateStockResponse,
  UsineAffectation,
  UpdatePrixLocalDto,
  PrixLocalResponse,
} from '@/models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  /**
   * GET /produits - Liste tous les produits (non archivés)
   */
  getAll(): Observable<Produit[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map(response => Produit.fromApiArray(response.data))
    );
  }

  /**
   * GET /produits - Liste avec filtres (sans recherche textuelle)
   */
  getAllFiltered(params: {
    statut?: ProduitStatut | null;
    type?: ProduitType | null;
    in_stock?: boolean | null;
    disponibles?: boolean | null;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Observable<Produit[]> {
    let httpParams = new HttpParams();
    if (params.statut)    httpParams = httpParams.set('statut', params.statut);
    if (params.type)      httpParams = httpParams.set('type', params.type);
    if (params.in_stock != null) httpParams = httpParams.set('in_stock', String(params.in_stock));
    if (params.disponibles) httpParams = httpParams.set('disponibles', '1');
    if (params.sort_by)   httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    return this.http.get<ApiResponse<any[]>>(this.apiUrl, { params: httpParams }).pipe(
      map(response => Produit.fromApiArray(response.data))
    );
  }

  /**
   * GET /produits/archived - Liste les produits archivés
   */
  getArchived(): Observable<Produit[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/archived`).pipe(
      map(response => Produit.fromApiArray(response.data))
    );
  }

  /**
   * GET /produits/pos - Catalogue POS (prix_effectifs inclus, produits actifs + activés localement)
   */
  getPos(params: {
    type?: ProduitType;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
  } = {}): Observable<Produit[]> {
    let httpParams = new HttpParams();
    if (params.type)       httpParams = httpParams.set('type', params.type);
    if (params.sort_by)    httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    if (params.per_page)   httpParams = httpParams.set('per_page', String(params.per_page));
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/pos`, { params: httpParams }).pipe(
      map(response => Produit.fromApiArray(response.data))
    );
  }

  /**
   * GET /produits/search - Recherche avec filtres
   */
  search(params: ProduitSearchParams): Observable<Produit[]> {
    let httpParams = new HttpParams();
    if (params.search)    httpParams = httpParams.set('search', params.search);
    if (params.type)      httpParams = httpParams.set('type', params.type);
    if (params.statut)    httpParams = httpParams.set('statut', params.statut);
    if (params.in_stock !== undefined) httpParams = httpParams.set('in_stock', params.in_stock.toString());
    if (params.page)      httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page)  httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.sort_by)   httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);

    return this.http.get<ApiResponse<{ produits: any[]; count: number }>>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      map(response => Produit.fromApiArray(response.data.produits))
    );
  }

  /**
   * GET /produits/statistics - Statistiques des produits
   */
  getStatistics(): Observable<ProduitStatistics> {
    return this.http.get<ApiResponse<ProduitStatistics>>(`${this.apiUrl}/statistics`).pipe(
      map(response => response.data)
    );
  }

  /**
   * GET /produits/{id} - Récupère un produit par son ID
   */
  getById(id: number): Observable<Produit> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * POST /produits - Crée un nouveau produit (JSON uniquement, sans image)
   */
  create(dto: CreateProduitDto): Observable<Produit> {
    const { image, ...jsonDto } = dto;
    return this.http.post<ApiResponse<any>>(this.apiUrl, jsonDto).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * PUT /produits/{id} - Met à jour un produit (JSON uniquement, sans image)
   */
  update(id: number, dto: CreateProduitDto): Observable<Produit> {
    const { image, ...jsonDto } = dto;
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, jsonDto).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * POST /produits/{id}/image - Upload ou remplace l'image d'un produit
   */
  uploadProduitImage(produitId: number, file: File): Observable<Produit> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${produitId}/image`, formData).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * DELETE /produits/{id}/image - Supprime l'image d'un produit
   */
  deleteProduitImage(produitId: number): Observable<Produit> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${produitId}/image`).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * DELETE /produits/{id} - Supprime un produit (soft delete)
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  /**
   * PATCH /produits/{id}/stock - Met à jour le stock de l'usine courante.
   * Retourne la réponse complète avec stock_alert pour afficher les alertes UI.
   */
  updateStock(id: number, dto: UpdateStockDto): Observable<UpdateStockResponse> {
    return this.http.patch<ApiResponse<UpdateStockResponse>>(`${this.apiUrl}/${id}/stock`, dto).pipe(
      map(response => response.data)
    );
  }

  /**
   * PATCH /produits/{id}/status - Change le statut global d'un produit
   */
  changeStatus(id: number, dto: ChangeStatusDto): Observable<Produit> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/status`, dto).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * PUT /produits/{id} — payload minimal { is_global } pour basculer le statut global.
   * false→true : usine_id=null, backend crée ProduitUsine+Stock pour toutes les usines.
   * true→false : usine_id = X-Usine-Id courante (envoyé par l'intercepteur).
   * Réservé admin/manager (403 sinon).
   */
  toggleGlobal(id: number, isGlobal: boolean): Observable<Produit> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, { is_global: isGlobal }).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * PATCH /produits/{id}/archive - Archive un produit
   */
  archive(id: number): Observable<Produit> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/archive`, {}).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  /**
   * PATCH /produits/{id}/unarchive - Désarchive un produit
   */
  unarchive(id: number): Observable<Produit> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/unarchive`, {}).pipe(
      map(response => Produit.fromApi(response.data))
    );
  }

  // ── Config locale par usine ───────────────────────────────────────────────

  /**
   * POST /produits/{id}/usines - Affecte un produit à une usine
   * 409 si déjà affecté.
   */
  affecterUsine(id: number, dto: UsineAffectation): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/usines`, dto).pipe(
      map(response => response.data)
    );
  }

  /**
   * DELETE /produits/{id}/usines/{usineId} - Désaffecte (supprime la config locale)
   * Le stock est conservé.
   */
  desaffecterUsine(id: number, usineId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/usines/${usineId}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * PATCH /produits/{id}/usines/{usineId}/activer - Active le produit localement au POS
   * 400 si statut global !== 'actif' ou déjà actif.
   */
  activerLocalement(id: number, usineId: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/usines/${usineId}/activer`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * PATCH /produits/{id}/usines/{usineId}/desactiver - Désactive le produit localement
   */
  desactiverLocalement(id: number, usineId: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/usines/${usineId}/desactiver`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * PATCH /produits/{id}/usines/{usineId}/prix - Met à jour les prix locaux
   * null = revenir au prix global.
   * 422 si aucun champ envoyé.
   */
  updatePrixLocal(id: number, usineId: number, dto: UpdatePrixLocalDto): Observable<PrixLocalResponse> {
    return this.http.patch<ApiResponse<PrixLocalResponse>>(`${this.apiUrl}/${id}/usines/${usineId}/prix`, dto).pipe(
      map(response => response.data)
    );
  }
}
