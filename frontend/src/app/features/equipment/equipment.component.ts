import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '@core/services/equipment.service';
import { Equipment, EquipmentCategory, EquipmentStatus, EquipmentRental, RentalStatus } from '@core/models/equipment.model';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">المعدات</h1>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          إضافة معدات
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="المعدات">
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <mat-card class="mat-elevation-z2">
                <mat-card-content>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{ availableCount }}</div>
                    <div class="text-gray-500">متاحة</div>
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card class="mat-elevation-z2">
                <mat-card-content>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ rentedCount }}</div>
                    <div class="text-gray-500">مؤجرة</div>
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card class="mat-elevation-z2">
                <mat-card-content>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600">{{ maintenanceCount }}</div>
                    <div class="text-gray-500">صيانة</div>
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card class="mat-elevation-z2">
                <mat-card-content>
                  <div class="text-center">
                    <div class="text-2xl font-bold">{{ totalCount }}</div>
                    <div class="text-gray-500">الاجمالي</div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="mat-elevation-z2 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="equipmentList" class="w-full">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>اسم المعدات</th>
                  <td mat-cell *matCellDef="let eq">{{ eq.name }}</td>
                </ng-container>

                <ng-container matColumnDef="serialNumber">
                  <th mat-header-cell *matHeaderCellDef>الرقم التسلسلي</th>
                  <td mat-cell *matCellDef="let eq">{{ eq.serialNumber }}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>الفئة</th>
                  <td mat-cell *matCellDef="let eq">
                    <mat-chip>{{ getCategoryLabel(eq.category) }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>الحالة</th>
                  <td mat-cell *matCellDef="let eq">
                    <mat-chip [color]="getStatusColor(eq.status)" selected>
                      {{ getStatusLabel(eq.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="dailyRate">
                  <th mat-header-cell *matHeaderCellDef>سعر الايجار اليومي</th>
                  <td mat-cell *matCellDef="let eq">{{ eq.dailyRentalRate | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
                  <td mat-cell *matCellDef="let eq">
                    <button mat-icon-button (click)="rentEquipment(eq)" *ngIf="eq.status === 'available'" color="accent">
                      <mat-icon>play_arrow</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteEquipment(eq)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="equipmentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: equipmentColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="الايجارات">
          <div class="p-4">
            <div class="mat-elevation-z2 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="rentals" class="w-full">
                <ng-container matColumnDef="equipment">
                  <th mat-header-cell *matHeaderCellDef>المعدات</th>
                  <td mat-cell *matCellDef="let r">{{ r.equipmentId }}</td>
                </ng-container>

                <ng-container matColumnDef="renterName">
                  <th mat-header-cell *matHeaderCellDef>المستأجر</th>
                  <td mat-cell *matCellDef="let r">{{ r.renterName }}</td>
                </ng-container>

                <ng-container matColumnDef="startDate">
                  <th mat-header-cell *matHeaderCellDef>تاريخ البداية</th>
                  <td mat-cell *matCellDef="let r">{{ r.startDate | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="endDate">
                  <th mat-header-cell *matHeaderCellDef>تاريخ النهاية</th>
                  <td mat-cell *matCellDef="let r">{{ r.endDate | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="totalCost">
                  <th mat-header-cell *matHeaderCellDef>التكلفة</th>
                  <td mat-cell *matCellDef="let r" class="font-medium">{{ r.totalCost | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>الحالة</th>
                  <td mat-cell *matCellDef="let r">
                    <mat-chip [color]="getRentalStatusColor(r.status)" selected>
                      {{ getRentalStatusLabel(r.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
                  <td mat-cell *matCellDef="let r">
                    <button mat-icon-button (click)="returnRental(r)" *ngIf="r.status === 'active'" color="primary">
                      <mat-icon>replay</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteRental(r)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="rentalColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: rentalColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class EquipmentComponent implements OnInit {
  equipmentColumns = ['name', 'serialNumber', 'category', 'status', 'dailyRate', 'actions'];
  rentalColumns = ['equipment', 'renterName', 'startDate', 'endDate', 'totalCost', 'status', 'actions'];
  
  equipmentList: Equipment[] = [];
  rentals: EquipmentRental[] = [];
  availableCount = 0;
  rentedCount = 0;
  maintenanceCount = 0;
  totalCount = 0;

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit() {
    this.loadEquipment();
    this.loadRentals();
  }

  loadEquipment() {
    this.equipmentService.getEquipment({ limit: 100 }).subscribe(response => {
      this.equipmentList = response.data;
      this.totalCount = response.total;
      this.availableCount = response.data.filter(e => e.status === 'available').length;
      this.rentedCount = response.data.filter(e => e.status === 'rented').length;
      this.maintenanceCount = response.data.filter(e => e.status === 'maintenance').length;
    });
  }

  loadRentals() {
    this.equipmentService.getRentals({ limit: 100 }).subscribe(response => {
      this.rentals = response.data;
    });
  }

  getCategoryLabel(category: EquipmentCategory): string {
    const labels: Record<EquipmentCategory, string> = {
      heavy_machinery: 'آليات ثقيلة',
      power_tools: 'أدوات كهربائية',
      safety_equipment: 'معدات safety',
      vehicles: 'مركبات',
      scaffolding: 'سقالات',
      other: 'أخرى'
    };
    return labels[category] || category;
  }

  getStatusColor(status: EquipmentStatus): string {
    switch (status) {
      case 'available': return 'accent';
      case 'rented': return 'primary';
      case 'maintenance': return 'warn';
      case 'out_of_service': return '';
      default: return '';
    }
  }

  getStatusLabel(status: EquipmentStatus): string {
    const labels: Record<EquipmentStatus, string> = {
      available: 'متاحة',
      rented: 'مؤجرة',
      maintenance: 'صيانة',
      out_of_service: 'خارج الخدمة'
    };
    return labels[status] || status;
  }

  getRentalStatusColor(status: RentalStatus): string {
    switch (status) {
      case 'active': return 'primary';
      case 'returned': return 'accent';
      case 'overdue': return 'warn';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getRentalStatusLabel(status: RentalStatus): string {
    const labels: Record<RentalStatus, string> = {
      active: 'نشط',
      returned: 'مُرجع',
      overdue: 'متأخر',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  openAddDialog() {}
  
  rentEquipment(equipment: Equipment) {}

  returnRental(rental: EquipmentRental) {
    this.equipmentService.returnRental(rental.id).subscribe(() => {
      this.loadRentals();
      this.loadEquipment();
    });
  }

  deleteEquipment(equipment: Equipment) {
    if (confirm('حذف هذه المعدات؟')) {
      this.equipmentService.deleteEquipment(equipment.id).subscribe(() => {
        this.loadEquipment();
      });
    }
  }

  deleteRental(rental: EquipmentRental) {
    if (confirm('حذف هذا الايجار؟')) {
      this.equipmentService.deleteRental(rental.id).subscribe(() => {
        this.loadRentals();
      });
    }
  }
}