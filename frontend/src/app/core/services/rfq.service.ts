import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RFQ, CreateRFQRequest, UpdateRFQRequest, RFQQueryParams, PaginatedRFQs } from '@core/models/rfq.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class RFQService {
  private apiUrl = `${environment.apiUrl}/rfqs`;

  constructor(private http: HttpClient) {}

  getRFQs(params?: RFQQueryParams): Observable<PaginatedRFQs> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedRFQs>(this.apiUrl, { params: httpParams });
  }

  getRFQ(id: string): Observable<RFQ> {
    return this.http.get<RFQ>(`${this.apiUrl}/${id}`);
  }

  createRFQ(rfq: CreateRFQRequest): Observable<RFQ> {
    return this.http.post<RFQ>(this.apiUrl, rfq);
  }

  updateRFQ(id: string, rfq: UpdateRFQRequest): Observable<RFQ> {
    return this.http.put<RFQ>(`${this.apiUrl}/${id}`, rfq);
  }

  deleteRFQ(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  sendToVendors(id: string, vendorIds: string[]): Observable<RFQ> {
    return this.http.put<RFQ>(`${this.apiUrl}/${id}/send`, { vendorIds });
  }

  awardVendor(rfqId: string, vendorId: string, amount: number): Observable<RFQ> {
    return this.http.put<RFQ>(`${this.apiUrl}/${rfqId}/award`, { vendorId, amount });
  }
}