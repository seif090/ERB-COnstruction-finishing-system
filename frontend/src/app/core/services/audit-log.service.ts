import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog, AuditLogQueryParams, PaginatedAuditLogs } from '@core/models/audit-log.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(params?: AuditLogQueryParams): Observable<PaginatedAuditLogs> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.userId) httpParams = httpParams.set('userId', params.userId);
      if (params.entityType) httpParams = httpParams.set('entityType', params.entityType);
      if (params.entityId) httpParams = httpParams.set('entityId', params.entityId);
      if (params.action) httpParams = httpParams.set('action', params.action);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<PaginatedAuditLogs>(this.apiUrl, { params: httpParams });
  }
}