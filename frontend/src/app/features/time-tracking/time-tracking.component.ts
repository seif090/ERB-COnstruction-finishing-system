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
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { TimeEntryService } from '@core/services/time-entry.service';
import { TimeEntry, TimeEntryStatus } from '@core/models/time-entry.model';

@Component({
  selector: 'app-time-tracking',
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
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">تتبع الوقت</h1>
        <button mat-raised-button color="primary" (click)="clockIn()">
          <mat-icon>login</mat-icon>
          تسجيل دخول
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ totalHours }}</div>
              <div class="text-gray-500">إجمالي الساعات</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ overtimeHours }}</div>
              <div class="text-gray-500">ساعات إضافية</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">بانتظار الاعتماد</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ approvedCount }}</div>
              <div class="text-gray-500">معتمد</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4 flex-wrap">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadTimeEntries()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="draft">مسودة</mat-option>
            <mat-option value="pending">بانتظار الاعتماد</mat-option>
            <mat-option value="approved">معتمد</mat-option>
            <mat-option value="rejected">مرفوض</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>من تاريخ</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="loadTimeEntries()">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>إلى تاريخ</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="loadTimeEntries()">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="timeEntries" class="w-full">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>الموظف</th>
            <td mat-cell *matCellDef="let te">{{ te.employeeName }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let te">{{ te.projectId || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>التاريخ</th>
            <td mat-cell *matCellDef="let te">{{ te.date | date:'shortDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="clockIn">
            <th mat-header-cell *matHeaderCellDef>الدخول</th>
            <td mat-cell *matCellDef="let te">{{ te.clockIn }}</td>
          </ng-container>

          <ng-container matColumnDef="clockOut">
            <th mat-header-cell *matHeaderCellDef>الخروج</th>
            <td mat-cell *matCellDef="let te">{{ te.clockOut || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="totalHours">
            <th mat-header-cell *matHeaderCellDef>الساعات</th>
            <td mat-cell *matCellDef="let te">{{ te.totalHours }} ساعة</td>
          </ng-container>

          <ng-container matColumnDef="overtime">
            <th mat-header-cell *matHeaderCellDef>إضافي</th>
            <td mat-cell *matCellDef="let te" [class.text-orange-600]="te.overtimeHours > 0">
              {{ te.overtimeHours }} ساعة
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let te">
              <mat-chip [color]="getStatusColor(te.status)" selected>
                {{ getStatusLabel(te.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let te">
              <button mat-icon-button (click)="clockOutEntry(te)" *ngIf="!te.clockOut" color="accent">
                <mat-icon>logout</mat-icon>
              </button>
              <button mat-icon-button (click)="approveEntry(te)" *ngIf="te.status === 'pending'" color="primary">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteEntry(te)" color="warn">
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
export class TimeTrackingComponent implements OnInit {
  displayedColumns = ['employee', 'project', 'date', 'clockIn', 'clockOut', 'totalHours', 'overtime', 'status', 'actions'];
  timeEntries: TimeEntry[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: TimeEntryStatus | '' = '';
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  endDate: Date = new Date();
  totalHours = 0;
  overtimeHours = 0;
  pendingCount = 0;
  approvedCount = 0;

  constructor(private timeEntryService: TimeEntryService) {}

  ngOnInit() {
    this.loadTimeEntries();
  }

  loadTimeEntries() {
    this.timeEntryService.getTimeEntries({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined,
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString()
    }).subscribe(response => {
      this.timeEntries = response.data;
      this.total = response.total;
      this.totalHours = response.totalHours;
      this.overtimeHours = response.overtimeHours;
    });

    this.timeEntryService.getTimeEntries({ limit: 100 }).subscribe(response => {
      this.pendingCount = response.data.filter(t => t.status === 'pending').length;
      this.approvedCount = response.data.filter(t => t.status === 'approved').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTimeEntries();
  }

  getStatusColor(status: TimeEntryStatus): string {
    switch (status) {
      case 'draft': return '';
      case 'pending': return 'warn';
      case 'approved': return 'accent';
      case 'rejected': return '';
      default: return '';
    }
  }

  getStatusLabel(status: TimeEntryStatus): string {
    const labels: Record<TimeEntryStatus, string> = {
      draft: 'مسودة',
      pending: 'بانتظار الاعتماد',
      approved: 'معتمد',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  }

  clockIn() {
    this.timeEntryService.clockIn('employee-id').subscribe(() => {
      this.loadTimeEntries();
    });
  }

  clockOutEntry(entry: TimeEntry) {
    this.timeEntryService.clockOut(entry.id).subscribe(() => {
      this.loadTimeEntries();
    });
  }

  approveEntry(entry: TimeEntry) {
    this.timeEntryService.updateTimeEntry(entry.id, { status: 'approved', approvedBy: 'Admin' }).subscribe(() => {
      this.loadTimeEntries();
    });
  }

  deleteEntry(entry: TimeEntry) {
    if (confirm('حذف هذا الدخول؟')) {
      this.timeEntryService.deleteTimeEntry(entry.id).subscribe(() => {
        this.loadTimeEntries();
      });
    }
  }
}