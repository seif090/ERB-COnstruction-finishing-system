import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialRequest, CreateMaterialRequestRequest, UpdateMaterialRequestRequest, MaterialRequestQueryParams, PaginatedMaterialRequests } from '@core/models/material-request.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class MaterialRequestService {
  private apiUrl = `${environment.apiUrl}/material-requests`;

  constructor(private http: HttpClient) {}

  getMaterialRequests(params?: MaterialRequestQueryParams): Observable<PaginatedMaterialRequests> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.requestedBy) httpParams = httpParams.set('requestedBy', params.requestedBy);
    }
    return this.http.get<PaginatedMaterialRequests>(this.apiUrl, { params: httpParams });
  }

  getMaterialRequest(id: string): Observable<MaterialRequest> {
    return this.http.get<MaterialRequest>(`${this.apiUrl}/${id}`);
  }

  createMaterialRequest(request: CreateMaterialRequestRequest): Observable<MaterialRequest> {
    return this.http.post<MaterialRequest>(this.apiUrl, request);
  }

  updateMaterialRequest(id: string, request: UpdateMaterialRequestRequest): Observable<MaterialRequest> {
    return this.http.put<MaterialRequest>(`${this.apiUrl}/${id}`, request);
  }

  deleteMaterialRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}