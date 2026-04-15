import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lead, CreateLeadRequest, UpdateLeadRequest, LeadQueryParams, PaginatedLeads } from '@core/models/lead.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(params?: LeadQueryParams): Observable<PaginatedLeads> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.source) httpParams = httpParams.set('source', params.source);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.assignedTo) httpParams = httpParams.set('assignedTo', params.assignedTo);
    }
    return this.http.get<PaginatedLeads>(this.apiUrl, { params: httpParams });
  }

  getLead(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  createLead(lead: CreateLeadRequest): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }

  updateLead(id: string, lead: UpdateLeadRequest): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}