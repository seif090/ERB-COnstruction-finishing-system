import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Warranty, CreateWarrantyRequest, UpdateWarrantyRequest, WarrantyQueryParams, PaginatedWarranties } from '@core/models/warranty.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class WarrantyService {
  private apiUrl = `${environment.apiUrl}/warranties`;

  constructor(private http: HttpClient) {}

  getWarranties(params?: WarrantyQueryParams): Observable<PaginatedWarranties> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.unitId) httpParams = httpParams.set('unitId', params.unitId);
      if (params.warrantyType) httpParams = httpParams.set('warrantyType', params.warrantyType);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.expiringWithinDays) httpParams = httpParams.set('expiringWithinDays', params.expiringWithinDays.toString());
    }
    return this.http.get<PaginatedWarranties>(this.apiUrl, { params: httpParams });
  }

  getWarranty(id: string): Observable<Warranty> {
    return this.http.get<Warranty>(`${this.apiUrl}/${id}`);
  }

  createWarranty(warranty: CreateWarrantyRequest): Observable<Warranty> {
    return this.http.post<Warranty>(this.apiUrl, warranty);
  }

  updateWarranty(id: string, warranty: UpdateWarrantyRequest): Observable<Warranty> {
    return this.http.put<Warranty>(`${this.apiUrl}/${id}`, warranty);
  }

  deleteWarranty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}