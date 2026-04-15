import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectBudget, BudgetForecast, CostChange, CreateBudgetRequest, UpdateBudgetRequest, BudgetQueryParams, PaginatedBudgets } from '@core/models/project-budget.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectBudgetService {
  private apiUrl = `${environment.apiUrl}/project-budgets`;
  private forecastUrl = `${environment.apiUrl}/budget-forecasts`;
  private changeUrl = `${environment.apiUrl}/cost-changes`;

  constructor(private http: HttpClient) {}

  getBudgets(params?: BudgetQueryParams): Observable<PaginatedBudgets> {
    let httpParams = new HttpParams();
    if (params && params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    return this.http.get<PaginatedBudgets>(this.apiUrl, { params: httpParams });
  }

  getBudget(projectId: string): Observable<ProjectBudget> {
    return this.http.get<ProjectBudget>(`${this.apiUrl}/${projectId}`);
  }

  createBudget(budget: CreateBudgetRequest): Observable<ProjectBudget> {
    return this.http.post<ProjectBudget>(this.apiUrl, budget);
  }

  updateBudget(projectId: string, budget: UpdateBudgetRequest): Observable<ProjectBudget> {
    return this.http.put<ProjectBudget>(`${this.apiUrl}/${projectId}`, budget);
  }

  deleteBudget(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}`);
  }

  getForecasts(projectId: string): Observable<BudgetForecast[]> {
    return this.http.get<BudgetForecast[]>(`${this.forecastUrl}/${projectId}`);
  }

  getCostChanges(projectId: string): Observable<CostChange[]> {
    return this.http.get<CostChange[]>(`${this.changeUrl}`, { params: { projectId } });
  }

  createCostChange(change: Partial<CostChange>): Observable<CostChange> {
    return this.http.post<CostChange>(this.changeUrl, change);
  }

  approveCostChange(id: string): Observable<CostChange> {
    return this.http.put<CostChange>(`${this.changeUrl}/${id}/approve`, {});
  }
}