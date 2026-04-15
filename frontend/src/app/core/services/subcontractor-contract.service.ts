import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubcontractorContract, CreateSubcontractorContractRequest, UpdateSubcontractorContractRequest, SubcontractorContractQueryParams, PaginatedSubcontractorContracts } from '@core/models/subcontractor-contract.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcontractorContractService {
  private apiUrl = `${environment.apiUrl}/subcontractor-contracts`;

  constructor(private http: HttpClient) {}

  getContracts(params?: SubcontractorContractQueryParams): Observable<PaginatedSubcontractorContracts> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.subcontractorId) httpParams = httpParams.set('subcontractorId', params.subcontractorId);
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedSubcontractorContracts>(this.apiUrl, { params: httpParams });
  }

  getContract(id: string): Observable<SubcontractorContract> {
    return this.http.get<SubcontractorContract>(`${this.apiUrl}/${id}`);
  }

  createContract(contract: CreateSubcontractorContractRequest): Observable<SubcontractorContract> {
    return this.http.post<SubcontractorContract>(this.apiUrl, contract);
  }

  updateContract(id: string, contract: UpdateSubcontractorContractRequest): Observable<SubcontractorContract> {
    return this.http.put<SubcontractorContract>(`${this.apiUrl}/${id}`, contract);
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approveContract(id: string): Observable<SubcontractorContract> {
    return this.http.put<SubcontractorContract>(`${this.apiUrl}/${id}/approve`, {});
  }
}