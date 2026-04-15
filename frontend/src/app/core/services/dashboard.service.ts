import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  DashboardStats, 
  RevenueChartData, 
  ProjectStatusChart, 
  TopClients, 
  TopProjects, 
  RecentActivity,
  MonthlyStats 
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats`);
  }

  getRevenueChart(year?: number): Observable<RevenueChartData> {
    const params = year ? { year: year.toString() } : {};
    return this.http.get<RevenueChartData>(`${this.API_URL}/revenue-chart`, { params });
  }

  getProjectStatusChart(): Observable<ProjectStatusChart> {
    return this.http.get<ProjectStatusChart>(`${this.API_URL}/project-status-chart`);
  }

  getTopClients(limit?: number): Observable<TopClients[]> {
    const params = limit ? { limit: limit.toString() } : {};
    return this.http.get<TopClients[]>(`${this.API_URL}/top-clients`, { params });
  }

  getTopProjects(limit?: number): Observable<TopProjects[]> {
    const params = limit ? { limit: limit.toString() } : {};
    return this.http.get<TopProjects[]>(`${this.API_URL}/top-projects`, { params });
  }

  getRecentActivity(limit?: number): Observable<RecentActivity[]> {
    const params = limit ? { limit: limit.toString() } : {};
    return this.http.get<RecentActivity[]>(`${this.API_URL}/recent-activity`, { params });
  }

  getMonthlyStats(year: number): Observable<MonthlyStats[]> {
    return this.http.get<MonthlyStats[]>(`${this.API_URL}/monthly-stats`, { params: { year: year.toString() } });
  }
}