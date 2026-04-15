import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkOrder, CreateWorkOrderRequest, UpdateWorkOrderRequest, WorkOrderQueryParams, PaginatedWorkOrders } from '@core/models/work-order.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private apiUrl = `${environment.apiUrl}/work-orders`;

  constructor(private http: HttpClient) {}

  getWorkOrders(params?: WorkOrderQueryParams): Observable<PaginatedWorkOrders> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.assignedTo) httpParams = httpParams.set('assignedTo', params.assignedTo);
      if (params.assignedType) httpParams = httpParams.set('assignedType', params.assignedType);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.priority) httpParams = httpParams.set('priority', params.priority);
    }
    return this.http.get<PaginatedWorkOrders>(this.apiUrl, { params: httpParams });
  }

  getWorkOrder(id: string): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.apiUrl}/${id}`);
  }

  createWorkOrder(workOrder: CreateWorkOrderRequest): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.apiUrl, workOrder);
  }

  updateWorkOrder(id: string, workOrder: UpdateWorkOrderRequest): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/${id}`, workOrder);
  }

  deleteWorkOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  completeWorkOrder(id: string): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/${id}/complete`, {});
  }
}