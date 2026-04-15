import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientFilter,
  ClientNote,
  ClientInteraction
} from '../models/client.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly API_URL = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClients(filter?: ClientFilter): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Client>>(this.API_URL, { params });
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}`);
  }

  createClient(data: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.API_URL, data);
  }

  updateClient(id: string, data: UpdateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${id}`, data);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getClientNotes(clientId: string): Observable<ClientNote[]> {
    return this.http.get<ClientNote[]>(`${this.API_URL}/${clientId}/notes`);
  }

  addClientNote(clientId: string, content: string): Observable<ClientNote> {
    return this.http.post<ClientNote>(`${this.API_URL}/${clientId}/notes`, { content });
  }

  deleteClientNote(clientId: string, noteId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${clientId}/notes/${noteId}`);
  }

  getClientInteractions(clientId: string): Observable<ClientInteraction[]> {
    return this.http.get<ClientInteraction[]>(`${this.API_URL}/${clientId}/interactions`);
  }

  addClientInteraction(clientId: string, data: {
    type: string;
    subject: string;
    description?: string;
  }): Observable<ClientInteraction> {
    return this.http.post<ClientInteraction>(`${this.API_URL}/${clientId}/interactions`, data);
  }

  uploadAttachment(clientId: string, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.API_URL}/${clientId}/attachments`, formData);
  }
}