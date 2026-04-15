import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SafetyIncident, SafetyMeeting, SafetyChecklist, CreateSafetyIncidentRequest, SafetyQueryParams, PaginatedIncidents } from '@core/models/safety.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SafetyService {
  private apiUrl = `${environment.apiUrl}/safety`;

  constructor(private http: HttpClient) {}

  getIncidents(params?: SafetyQueryParams): Observable<PaginatedIncidents> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.severity) httpParams = httpParams.set('severity', params.severity);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<PaginatedIncidents>(`${this.apiUrl}/incidents`, { params: httpParams });
  }

  getIncident(id: string): Observable<SafetyIncident> {
    return this.http.get<SafetyIncident>(`${this.apiUrl}/incidents/${id}`);
  }

  createIncident(incident: CreateSafetyIncidentRequest): Observable<SafetyIncident> {
    return this.http.post<SafetyIncident>(`${this.apiUrl}/incidents`, incident);
  }

  updateIncident(id: string, incident: Partial<SafetyIncident>): Observable<SafetyIncident> {
    return this.http.put<SafetyIncident>(`${this.apiUrl}/incidents/${id}`, incident);
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/incidents/${id}`);
  }

  getMeetings(projectId?: string): Observable<SafetyMeeting[]> {
    let httpParams = new HttpParams();
    if (projectId) httpParams = httpParams.set('projectId', projectId);
    return this.http.get<SafetyMeeting[]>(`${this.apiUrl}/meetings`, { params: httpParams });
  }

  createMeeting(meeting: Partial<SafetyMeeting>): Observable<SafetyMeeting> {
    return this.http.post<SafetyMeeting>(`${this.apiUrl}/meetings`, meeting);
  }

  getChecklists(projectId?: string): Observable<SafetyChecklist[]> {
    let httpParams = new HttpParams();
    if (projectId) httpParams = httpParams.set('projectId', projectId);
    return this.http.get<SafetyChecklist[]>(`${this.apiUrl}/checklists`, { params: httpParams });
  }

  closeIncident(id: string): Observable<SafetyIncident> {
    return this.http.put<SafetyIncident>(`${this.apiUrl}/incidents/${id}/close`, {});
  }
}