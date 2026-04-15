import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentRental, CreateEquipmentRequest, CreateRentalRequest, EquipmentQueryParams, RentalQueryParams, PaginatedEquipment, PaginatedRentals } from '@core/models/equipment.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;
  private rentalApiUrl = `${environment.apiUrl}/equipment-rentals`;

  constructor(private http: HttpClient) {}

  getEquipment(params?: EquipmentQueryParams): Observable<PaginatedEquipment> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedEquipment>(this.apiUrl, { params: httpParams });
  }

  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  createEquipment(equipment: CreateEquipmentRequest): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  updateEquipment(id: string, equipment: Partial<CreateEquipmentRequest>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }

  deleteEquipment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRentals(params?: RentalQueryParams): Observable<PaginatedRentals> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.equipmentId) httpParams = httpParams.set('equipmentId', params.equipmentId);
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedRentals>(this.rentalApiUrl, { params: httpParams });
  }

  createRental(rental: CreateRentalRequest): Observable<EquipmentRental> {
    return this.http.post<EquipmentRental>(this.rentalApiUrl, rental);
  }

  returnRental(id: string): Observable<EquipmentRental> {
    return this.http.put<EquipmentRental>(`${this.rentalApiUrl}/${id}/return`, {});
  }

  deleteRental(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rentalApiUrl}/${id}`);
  }
}