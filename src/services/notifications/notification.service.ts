import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiNotification } from '@/models/notification.model';

/** Wrapper générique des réponses API Laravel */
interface ApiWrapper<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface NotificationsResponse {
  notifications: ApiNotification[];
  unread_count: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /** GET /api/v1/notifications?unread_only=true */
  getNotifications(unreadOnly = true): Observable<NotificationsResponse> {
    const params = new HttpParams().set('unread_only', unreadOnly);
    return this.http
      .get<ApiWrapper<NotificationsResponse>>(this.apiUrl, { params })
      .pipe(
        map(r => r.data),
        catchError(err => throwError(() => err))
      );
  }

  /** POST /api/v1/notifications/{id}/read */
  markAsRead(id: string): Observable<{ unread_count: number }> {
    return this.http
      .post<ApiWrapper<{ unread_count: number }>>(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        map(r => r.data),
        catchError(err => throwError(() => err))
      );
  }

  /** POST /api/v1/notifications/read-all */
  markAllAsRead(): Observable<{ unread_count: number }> {
    return this.http
      .post<ApiWrapper<{ unread_count: number }>>(`${this.apiUrl}/read-all`, {})
      .pipe(
        map(r => r.data),
        catchError(err => throwError(() => err))
      );
  }
}
