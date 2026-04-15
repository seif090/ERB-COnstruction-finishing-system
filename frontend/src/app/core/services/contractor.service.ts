import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Contractor, ContractorFilter, CreateContractorRequest, UpdateContractorRequest } from '../models/contractor.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ContractorService {
  private readonly API_URL = `${environment.apiUrl}/contractors`;

  constructor(private http: HttpClient) {}

  getContractors(filter?: ContractorFilter): Observable<PaginatedResponse<Contractor>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<PaginatedResponse<Contractor>>(this.API_URL, { params });
  }

  getContractor(id: string): Observable<Contractor> {
    return this.http.get<Contractor>(`${this.API_URL}/${id}`);
  }

  createContractor(data: CreateContractorRequest): Observable<Contractor> {
    return this.http.post<Contractor>(this.API_URL, data);
  }

  updateContractor(id: string, data: UpdateContractorRequest): Observable<Contractor> {
    return this.http.put<Contractor>(`${this.API_URL}/${id}`, data);
  }

  deleteContractor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}