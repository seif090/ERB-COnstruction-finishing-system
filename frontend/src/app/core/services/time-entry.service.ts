import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntry, CreateTimeEntryRequest, UpdateTimeEntryRequest, TimeEntryQueryParams, PaginatedTimeEntries, EmployeeAttendanceSummary } from '@core/models/time-entry.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {
  private apiUrl = `${environment.apiUrl}/time-entries`;

  constructor(private http: HttpClient) {}

  getTimeEntries(params?: TimeEntryQueryParams): Observable<PaginatedTimeEntries> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedTimeEntries>(this.apiUrl, { params: httpParams });
  }

  getTimeEntry(id: string): Observable<TimeEntry> {
    return this.http.get<TimeEntry>(`${this.apiUrl}/${id}`);
  }

  createTimeEntry(entry: CreateTimeEntryRequest): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(this.apiUrl, entry);
  }

  updateTimeEntry(id: string, entry: UpdateTimeEntryRequest): Observable<TimeEntry> {
    return this.http.put<TimeEntry>(`${this.apiUrl}/${id}`, entry);
  }

  deleteTimeEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clockIn(employeeId: string, projectId?: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.apiUrl}/clock-in`, { employeeId, projectId });
  }

  clockOut(id: string): Observable<TimeEntry> {
    return this.http.put<TimeEntry>(`${this.apiUrl}/${id}/clock-out`, {});
  }

  getAttendanceSummary(employeeId: string, startDate: string, endDate: string): Observable<EmployeeAttendanceSummary> {
    return this.http.get<EmployeeAttendanceSummary>(`${this.apiUrl}/summary/${employeeId}`, {
      params: { startDate, endDate }
    });
  }
}