import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QualityInspection, QualityControlChecklist, CreateQualityInspectionRequest, UpdateInspectionRequest, QCQueryParams, PaginatedInspections } from '@core/models/quality-control.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class QualityControlService {
  private apiUrl = `${environment.apiUrl}/quality-control`;
  private checklistUrl = `${this.apiUrl}/checklists`;

  constructor(private http: HttpClient) {}

  getInspections(params?: QCQueryParams): Observable<PaginatedInspections> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<PaginatedInspections>(`${this.apiUrl}/inspections`, { params: httpParams });
  }

  getInspection(id: string): Observable<QualityInspection> {
    return this.http.get<QualityInspection>(`${this.apiUrl}/inspections/${id}`);
  }

  createInspection(inspection: CreateQualityInspectionRequest): Observable<QualityInspection> {
    return this.http.post<QualityInspection>(`${this.apiUrl}/inspections`, inspection);
  }

  updateInspection(id: string, inspection: UpdateInspectionRequest): Observable<QualityInspection> {
    return this.http.put<QualityInspection>(`${this.apiUrl}/inspections/${id}`, inspection);
  }

  deleteInspection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inspections/${id}`);
  }

  getChecklists(projectId?: string): Observable<QualityControlChecklist[]> {
    let httpParams = new HttpParams();
    if (projectId) httpParams = httpParams.set('projectId', projectId);
    return this.http.get<QualityControlChecklist[]>(this.checklistUrl, { params: httpParams });
  }

  createChecklist(checklist: Partial<QualityControlChecklist>): Observable<QualityControlChecklist> {
    return this.http.post<QualityControlChecklist>(this.checklistUrl, checklist);
  }

  updateFinding(inspectionId: string, findingId: string, status: string): Observable<QualityInspection> {
    return this.http.put<QualityInspection>(`${this.apiUrl}/inspections/${inspectionId}/findings/${findingId}`, { status });
  }
}