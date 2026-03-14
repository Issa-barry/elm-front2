import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  FacturePacking,
  StoreFacturePackingDto,
  ComptabiliteSummary,
  PreviewFacturePacking,
  FacturePackingFilters,
  ComptabiliteFilters,
  StoreVersementDto,
  VersementIndexResponse,
  VersementStoreResponse,
} from '@/models/facture-packing.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class FacturePaiementService {
  private readonly apiUrl = `${environment.apiUrl}/facture-packings`;

  constructor(private http: HttpClient) {}

  /**
   * Liste des factures avec filtres optionnels
   */
  getFactures(filters?: FacturePackingFilters): Observable<ApiResponse<FacturePacking[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.prestataire_id) {
        params = params.set('prestataire_id', filters.prestataire_id.toString());
      }
      if (filters.date_debut) {
        params = params.set('date_debut', filters.date_debut);
      }
      if (filters.date_fin) {
        params = params.set('date_fin', filters.date_fin);
      }
      if (filters.statut) {
        params = params.set('statut', filters.statut);
      }
      if (filters.soldee !== undefined) {
        params = params.set('soldee', filters.soldee.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
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
    }

    return this.http.get<ApiResponse<FacturePacking[]>>(this.apiUrl, { params });
  }

  /**
   * Détail d'une facture
   */
  getFacture(id: number): Observable<ApiResponse<FacturePacking>> {
    return this.http.get<ApiResponse<FacturePacking>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Prévisualisation avant facturation
   */
  getPreview(prestataireId: number, dateDebut: string, dateFin: string): Observable<ApiResponse<PreviewFacturePacking>> {
    const params = new HttpParams()
      .set('prestataire_id', prestataireId.toString())
      .set('date_debut', dateDebut)
      .set('date_fin', dateFin);

    return this.http.get<ApiResponse<PreviewFacturePacking>>(`${this.apiUrl}/preview`, { params });
  }

  /**
   * Comptabilité - récapitulatif par prestataire
   */
  getComptabilite(filters?: ComptabiliteFilters): Observable<ApiResponse<ComptabiliteSummary>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.date_debut) {
        params = params.set('date_debut', filters.date_debut);
      }
      if (filters.date_fin) {
        params = params.set('date_fin', filters.date_fin);
      }
      if (filters.prestataire_id) {
        params = params.set('prestataire_id', filters.prestataire_id.toString());
      }
    }

    return this.http.get<ApiResponse<ComptabiliteSummary>>(`${this.apiUrl}/comptabilite`, { params });
  }

  /**
   * Créer une facture
   */
  createFacture(data: StoreFacturePackingDto): Observable<ApiResponse<FacturePacking>> {
    return this.http.post<ApiResponse<FacturePacking>>(this.apiUrl, data);
  }

  /**
   * Supprimer une facture
   */
  deleteFacture(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  // ========================= Versements =========================

  /**
   * Liste des versements d'une facture
   */
  getVersements(factureId: number): Observable<ApiResponse<VersementIndexResponse>> {
    return this.http.get<ApiResponse<VersementIndexResponse>>(`${this.apiUrl}/${factureId}/versements`);
  }

  /**
   * Créer un versement
   */
  createVersement(factureId: number, data: StoreVersementDto): Observable<ApiResponse<VersementStoreResponse>> {
    return this.http.post<ApiResponse<VersementStoreResponse>>(`${this.apiUrl}/${factureId}/versements`, data);
  }

  /**
   * Supprimer un versement
   */
  deleteVersement(factureId: number, versementId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${factureId}/versements/${versementId}`);
  }
}
