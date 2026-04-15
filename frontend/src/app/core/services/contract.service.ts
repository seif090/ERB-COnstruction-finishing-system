import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Contract, ContractFilter, CreateContractRequest, UpdateContractRequest } from '../models/contract.model';
import { Payment } from '../models/contract.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly API_URL = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  getContracts(filter?: ContractFilter): Observable<PaginatedResponse<Contract>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<PaginatedResponse<Contract>>(this.API_URL, { params });
  }

  getContract(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.API_URL}/${id}`);
  }

  createContract(data: CreateContractRequest): Observable<Contract> {
    return this.http.post<Contract>(this.API_URL, data);
  }

  updateContract(id: string, data: UpdateContractRequest): Observable<Contract> {
    return this.http.put<Contract>(`${this.API_URL}/${id}`, data);
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  generatePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/pdf`, { responseType: 'blob' });
  }

  getContractPayments(contractId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.API_URL}/${contractId}/payments`);
  }
}