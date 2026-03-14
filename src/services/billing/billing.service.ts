import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { BillingEvent, BillingEventsFilter } from '@/models/billing.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/billing`;

  getEvents(filters?: BillingEventsFilter): Observable<BillingEvent[]> {
    let params = new HttpParams();
    if (filters?.organisation_id) {
      params = params.set('organisation_id', filters.organisation_id.toString());
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.forfait) {
      params = params.set('forfait', filters.forfait);
    }
    return this.http
      .get<ApiResponse<BillingEvent[]>>(`${this.apiBase}/events`, { params })
      .pipe(map((res) => res.data));
  }

  markPaid(id: number): Observable<BillingEvent> {
    return this.http
      .patch<ApiResponse<BillingEvent>>(`${this.apiBase}/events/${id}/paid`, {})
      .pipe(map((res) => res.data));
  }
}
