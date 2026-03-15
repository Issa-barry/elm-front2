import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnnulerCommandeVenteDto, CommandeVente, StatutCommandeVente, StoreCommandeVenteDto, UpdateCommandeVenteDto } from '@/models/vente.model';
import { ApiResponse, PaginatedData } from '@/services/livraisons/facture-livraison.service';

@Injectable({ providedIn: 'root' })
export class CommandeVenteService {
  private readonly url = `${environment.apiUrl}/ventes/commandes`;

  constructor(private http: HttpClient) {}

  getCommandes(params?: {
    vehicule_id?: number;
    page?: number;
    statut?: StatutCommandeVente;
  }): Observable<ApiResponse<PaginatedData<CommandeVente>>> {
    let httpParams = new HttpParams();
    if (params?.vehicule_id) httpParams = httpParams.set('vehicule_id', String(params.vehicule_id));
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    return this.http.get<ApiResponse<PaginatedData<CommandeVente>>>(this.url, { params: httpParams });
  }

  getCommande(id: number): Observable<ApiResponse<CommandeVente>> {
    return this.http.get<ApiResponse<CommandeVente>>(`${this.url}/${id}`);
  }

  createCommande(data: StoreCommandeVenteDto): Observable<ApiResponse<CommandeVente>> {
    return this.http.post<ApiResponse<CommandeVente>>(this.url, data);
  }

  updateCommande(id: number, data: UpdateCommandeVenteDto): Observable<ApiResponse<CommandeVente>> {
    return this.http.put<ApiResponse<CommandeVente>>(`${this.url}/${id}`, data);
  }

  annulerCommande(id: number, data: AnnulerCommandeVenteDto): Observable<ApiResponse<CommandeVente>> {
    return this.http.post<ApiResponse<CommandeVente>>(`${this.url}/${id}/annuler`, data);
  }

  deleteCommande(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`);
  }
}
