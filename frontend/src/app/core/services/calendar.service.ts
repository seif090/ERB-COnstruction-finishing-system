import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest, CalendarEventQueryParams, PaginatedCalendarEvents } from '@core/models/calendar.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar-events`;

  constructor(private http: HttpClient) {}

  getEvents(params?: CalendarEventQueryParams): Observable<PaginatedCalendarEvents> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
      if (params.eventType) httpParams = httpParams.set('eventType', params.eventType);
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    }
    return this.http.get<PaginatedCalendarEvents>(this.apiUrl, { params: httpParams });
  }

  getEvent(id: string): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: CreateCalendarEventRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.apiUrl, event);
  }

  updateEvent(id: string, event: UpdateCalendarEventRequest): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}