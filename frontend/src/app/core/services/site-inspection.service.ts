import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteInspection, CreateSiteInspectionRequest, UpdateSiteInspectionRequest, SiteInspectionQueryParams, PaginatedSiteInspections } from '@core/models/site-inspection.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteInspectionService {
  private apiUrl = `${environment.apiUrl}/site-inspections`;

  constructor(private http: HttpClient) {}

  getInspections(params?: SiteInspectionQueryParams): Observable<PaginatedSiteInspections> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.inspectorId) httpParams = httpParams.set('inspectorId', params.inspectorId);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<PaginatedSiteInspections>(this.apiUrl, { params: httpParams });
  }

  getInspection(id: string): Observable<SiteInspection> {
    return this.http.get<SiteInspection>(`${this.apiUrl}/${id}`);
  }

  createInspection(inspection: CreateSiteInspectionRequest): Observable<SiteInspection> {
    return this.http.post<SiteInspection>(this.apiUrl, inspection);
  }

  updateInspection(id: string, inspection: UpdateSiteInspectionRequest): Observable<SiteInspection> {
    return this.http.put<SiteInspection>(`${this.apiUrl}/${id}`, inspection);
  }

  deleteInspection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}