import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommissionVente, BeneficiaireType, StoreVersementDto } from '@/models/vente.model';
import { ApiResponse } from '@/services/livraisons/facture-livraison.service';

/** Pagination plate retournée par l'API Laravel (sans meta imbriqué) */
export interface FlatPaginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface CommissionTotaux {
  montant_total: number;
  montant_verse: number;
  montant_restant: number;
  nb_commissions: number;
}

export interface CommissionListData {
  totaux: CommissionTotaux;
  commissions: FlatPaginated<CommissionVente>;
}

@Injectable({ providedIn: 'root' })
export class CommissionVenteService {
  private readonly url = `${environment.apiUrl}/ventes/commissions`;

  constructor(private http: HttpClient) {}

  getAll(
    params: HttpParams
  ): Observable<ApiResponse<CommissionListData>> {
    return this.http
      .get<ApiResponse<CommissionListData | FlatPaginated<CommissionVente>>>(this.url, { params })
      .pipe(
        map((resp) => ({
          ...resp,
          data: this.normalizeListData(resp.data),
        }))
      );
  }

  getById(id: number): Observable<ApiResponse<CommissionVente>> {
    return this.http.get<ApiResponse<CommissionVente>>(`${this.url}/${id}`);
  }

  /** Versement partiel ou total avec montant saisi */
  verser(
    id: number,
    type: BeneficiaireType,
    dto: StoreVersementDto
  ): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.url}/${id}/versements/${type}`,
      dto
    );
  }

  private normalizeListData(
    data: CommissionListData | FlatPaginated<CommissionVente>
  ): CommissionListData {
    const maybeNew = data as Partial<CommissionListData>;
    if (maybeNew && maybeNew.commissions) {
      const commissions = maybeNew.commissions;
      return {
        totaux: this.normalizeTotaux(maybeNew.totaux, commissions?.total ?? 0),
        commissions,
      };
    }

    const commissions = data as FlatPaginated<CommissionVente>;
    return {
      totaux: {
        montant_total: 0,
        montant_verse: 0,
        montant_restant: 0,
        nb_commissions: Number(commissions?.total ?? 0),
      },
      commissions,
    };
  }

  private normalizeTotaux(
    totaux: Partial<CommissionTotaux> | undefined,
    fallbackCount: number
  ): CommissionTotaux {
    return {
      montant_total: Number(totaux?.montant_total ?? 0),
      montant_verse: Number(totaux?.montant_verse ?? 0),
      montant_restant: Number(totaux?.montant_restant ?? 0),
      nb_commissions: Number(totaux?.nb_commissions ?? fallbackCount ?? 0),
    };
  }
}
