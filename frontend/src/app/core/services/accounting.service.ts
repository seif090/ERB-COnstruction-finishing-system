import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Transaction, TransactionFilter, CreateTransactionRequest, AccountingSummary } from '../models/accounting.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private readonly API_URL = `${environment.apiUrl}/accounting`;

  constructor(private http: HttpClient) {}

  getTransactions(filter?: TransactionFilter): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<PaginatedResponse<Transaction>>(this.API_URL, { params });
  }

  createTransaction(data: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.API_URL, data);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getSummary(startDate?: string, endDate?: string): Observable<AccountingSummary> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<AccountingSummary>(`${this.API_URL}/summary`, { params });
  }
}