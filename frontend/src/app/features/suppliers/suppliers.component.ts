import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '@core/services/supplier.service';
import { Supplier, SupplierCategory, SupplierStatus } from '@core/models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ 'Suppliers'  }}</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          {{ 'Add Supplier'  }}
        </button>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-64">
          <mat-label>{{ 'Search'  }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="{{ 'Search suppliers'  }}">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Category'  }}</mat-label>
          <mat-select [(ngModel)]="filterCategory" (selectionChange)="loadSuppliers()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="materials">{{ 'Materials'  }}</mat-option>
            <mat-option value="equipment">{{ 'Equipment'  }}</mat-option>
            <mat-option value="furniture">{{ 'Furniture'  }}</mat-option>
            <mat-option value="electrical">{{ 'Electrical'  }}</mat-option>
            <mat-option value="plumbing">{{ 'Plumbing'  }}</mat-option>
            <mat-option value="paint">{{ 'Paint'  }}</mat-option>
            <mat-option value="tools">{{ 'Tools'  }}</mat-option>
            <mat-option value="other">{{ 'Other'  }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Status'  }}</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadSuppliers()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="active">{{ 'Active'  }}</mat-option>
            <mat-option value="inactive">{{ 'Inactive'  }}</mat-option>
            <mat-option value="blocked">{{ 'Blocked'  }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-card *ngFor="let supplier of suppliers" class="mat-elevation-z2">
          <mat-card-content>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-lg">{{ supplier.name }}</h3>
                <p class="text-sm text-gray-500">{{ supplier.category | titlecase }}</p>
                <p class="text-sm">{{ supplier.email }}</p>
                <p class="text-sm">{{ supplier.phone }}</p>
                <p class="text-sm" *ngIf="supplier.contactPerson">{{ 'Contact:'  }} {{ supplier.contactPerson }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <mat-chip [color]="getStatusColor(supplier.status)" selected>
                  {{ getStatusLabel(supplier.status) }}
                </mat-chip>
                <div class="flex gap-1">
                  <button mat-icon-button [routerLink]="[supplier.id]" color="primary">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteSupplier(supplier)" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="supplier.rating" class="mt-2">
              <span class="text-yellow-500">★</span> {{ supplier.rating }}/5
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="suppliers.length === 0" class="text-center py-12 text-gray-500">
        <mat-icon class="text-6xl">local_shipping</mat-icon>
        <p class="mt-4">{{ 'No suppliers found'  }}</p>
      </div>

      <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1" [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)"></mat-paginator>
    </div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';
  filterCategory: SupplierCategory | '' = '';
  filterStatus: SupplierStatus | '' = '';

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.getSuppliers({
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      category: this.filterCategory || undefined,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.suppliers = response.data;
      this.total = response.total;
    });
  }

  search() {
    this.page = 1;
    this.loadSuppliers();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadSuppliers();
  }

  getStatusColor(status: SupplierStatus): string {
    switch (status) {
      case 'active': return 'accent';
      case 'inactive': return 'warn';
      case 'blocked': return '';
      default: return '';
    }
  }

  getStatusLabel(status: SupplierStatus): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(supplier.id).subscribe(() => {
        this.loadSuppliers();
      });
    }
  }
}