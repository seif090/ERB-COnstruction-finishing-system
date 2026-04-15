import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  InventoryItem, InventoryFilter, CreateInventoryItemRequest, UpdateInventoryItemRequest,
  InventoryTransaction, CreateInventoryTransactionRequest
} from '../models/inventory.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly API_URL = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getItems(filter?: InventoryFilter): Observable<PaginatedResponse<InventoryItem>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<PaginatedResponse<InventoryItem>>(`${this.API_URL}/items`, { params });
  }

  getItem(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.API_URL}/items/${id}`);
  }

  createItem(data: CreateInventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.API_URL}/items`, data);
  }

  updateItem(id: string, data: UpdateInventoryItemRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.API_URL}/items/${id}`, data);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${id}`);
  }

  getTransactions(itemId?: string, filter?: any): Observable<InventoryTransaction[]> {
    let params = new HttpParams();
    if (itemId) params = params.set('itemId', itemId);
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<InventoryTransaction[]>(`${this.API_URL}/transactions`, { params });
  }

  createTransaction(data: CreateInventoryTransactionRequest): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(`${this.API_URL}/transactions`, data);
  }
}