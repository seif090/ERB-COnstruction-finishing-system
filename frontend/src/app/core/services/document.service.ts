import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, CreateDocumentRequest, DocumentQueryParams, PaginatedDocuments } from '@core/models/document.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(params?: DocumentQueryParams): Observable<PaginatedDocuments> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.relatedType) httpParams = httpParams.set('relatedType', params.relatedType);
      if (params.relatedId) httpParams = httpParams.set('relatedId', params.relatedId);
    }
    return this.http.get<PaginatedDocuments>(this.apiUrl, { params: httpParams });
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(document: CreateDocumentRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('name', document.name);
    formData.append('file', document.file);
    formData.append('category', document.category);
    if (document.relatedType) formData.append('relatedType', document.relatedType);
    if (document.relatedId) formData.append('relatedId', document.relatedId);
    if (document.description) formData.append('description', document.description);
    return this.http.post<Document>(this.apiUrl, formData);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}