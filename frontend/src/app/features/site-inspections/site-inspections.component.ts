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
import { FormsModule } from '@angular/forms';
import { SiteInspectionService } from '@core/services/site-inspection.service';
import { SiteInspection, InspectionStatus } from '@core/models/site-inspection.model';

@Component({
  selector: 'app-site-inspections',
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
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">التفتيش الميداني</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          تفتيش جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ scheduledCount }}</div>
              <div class="text-gray-500">مجدول</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ inProgressCount }}</div>
              <div class="text-gray-500">قيد التنفيذ</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ completedCount }}</div>
              <div class="text-gray-500">مكتمل</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ followUpCount }}</div>
              <div class="text-gray-500">يحتاج متابعة</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadInspections()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="scheduled">مجدول</mat-option>
            <mat-option value="in_progress">قيد التنفيذ</mat-option>
            <mat-option value="completed">مكتمل</mat-option>
            <mat-option value="needs_follow_up">يحتاج متابعة</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="inspections" class="w-full">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>العنوان</th>
            <td mat-cell *matCellDef="let ins">{{ ins.title }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let ins">{{ ins.projectId }}</td>
          </ng-container>

          <ng-container matColumnDef="inspector">
            <th mat-header-cell *matHeaderCellDef>المفتش</th>
            <td mat-cell *matCellDef="let ins">{{ ins.inspectorName }}</td>
          </ng-container>

          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>الموقع</th>
            <td mat-cell *matCellDef="let ins">{{ ins.location }}</td>
          </ng-container>

          <ng-container matColumnDef="issuesCount">
            <th mat-header-cell *matHeaderCellDef>المشاكل</th>
            <td mat-cell *matCellDef="let ins">
              <span class="font-medium" [class.text-red-600]="ins.issuesCount > 0">
                {{ ins.issuesCount }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let ins">
              <mat-chip [color]="getStatusColor(ins.status)" selected>
                {{ getStatusLabel(ins.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="inspectionDate">
            <th mat-header-cell *matHeaderCellDef>التاريخ</th>
            <td mat-cell *matCellDef="let ins">{{ ins.inspectionDate | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let ins">
              <button mat-icon-button [routerLink]="[ins.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="completeInspection(ins)" *ngIf="ins.status === 'in_progress'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteInspection(ins)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1" [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)"></mat-paginator>
      </div>
    </div>
  `
})
export class SiteInspectionsComponent implements OnInit {
  displayedColumns = ['title', 'project', 'inspector', 'location', 'issuesCount', 'status', 'inspectionDate', 'actions'];
  inspections: SiteInspection[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: InspectionStatus | '' = '';
  scheduledCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  followUpCount = 0;

  constructor(private siteInspectionService: SiteInspectionService) {}

  ngOnInit() {
    this.loadInspections();
  }

  loadInspections() {
    this.siteInspectionService.getInspections({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.inspections = response.data;
      this.total = response.total;
    });

    this.siteInspectionService.getInspections({ limit: 100 }).subscribe(response => {
      this.scheduledCount = response.data.filter(i => i.status === 'scheduled').length;
      this.inProgressCount = response.data.filter(i => i.status === 'in_progress').length;
      this.completedCount = response.data.filter(i => i.status === 'completed').length;
      this.followUpCount = response.data.filter(i => i.status === 'needs_follow_up').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadInspections();
  }

  getStatusColor(status: InspectionStatus): string {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warn';
      case 'completed': return 'accent';
      case 'needs_follow_up': return '';
      default: return '';
    }
  }

  getStatusLabel(status: InspectionStatus): string {
    const labels: Record<InspectionStatus, string> = {
      scheduled: 'مجدول',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      needs_follow_up: 'يحتاج متابعة'
    };
    return labels[status] || status;
  }

  completeInspection(ins: SiteInspection) {
    this.siteInspectionService.updateInspection(ins.id, { status: 'completed' }).subscribe(() => {
      this.loadInspections();
    });
  }

  deleteInspection(ins: SiteInspection) {
    if (confirm('حذف هذا التفتيش؟')) {
      this.siteInspectionService.deleteInspection(ins.id).subscribe(() => {
        this.loadInspections();
      });
    }
  }
}