import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Unit, UnitFilter, CreateUnitRequest, UpdateUnitRequest } from '../models/unit.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly API_URL = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {}

  getUnits(filter?: UnitFilter): Observable<PaginatedResponse<Unit>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, value.toString());
      });
    }
    return this.http.get<PaginatedResponse<Unit>>(this.API_URL, { params });
  }

  getUnit(id: string): Observable<Unit> {
    return this.http.get<Unit>(`${this.API_URL}/${id}`);
  }

  createUnit(data: CreateUnitRequest): Observable<Unit> {
    return this.http.post<Unit>(this.API_URL, data);
  }

  updateUnit(id: string, data: UpdateUnitRequest): Observable<Unit> {
    return this.http.put<Unit>(`${this.API_URL}/${id}`, data);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadImages(unitId: string, files: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<{ urls: string[] }>(`${this.API_URL}/${unitId}/images`, formData);
  }
}