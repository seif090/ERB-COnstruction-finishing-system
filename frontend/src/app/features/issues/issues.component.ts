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
import { IssueService } from '@core/services/issue.service';
import { Issue, IssueStatus, IssuePriority } from '@core/models/issue.model';

@Component({
  selector: 'app-issues',
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
        <h1 class="text-2xl font-bold">تتبع المشكلات</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          مشكلة جديدة
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ criticalCount }}</div>
              <div class="text-gray-500">حرج</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ highCount }}</div>
              <div class="text-gray-500">عالية</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ openCount }}</div>
              <div class="text-gray-500">مفتوح</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ resolvedCount }}</div>
              <div class="text-gray-500">محلول</div>
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

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الحالة</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadIssues()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="open">مفتوح</mat-option>
            <mat-option value="in_progress">قيد التنفيذ</mat-option>
            <mat-option value="resolved">محلول</mat-option>
            <mat-option value="closed">مُغلق</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الأولوية</mat-label>
          <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadIssues()">
            <mat-option value="">الكل</mat-option>
            <mat-option value="critical">حرجة</mat-option>
            <mat-option value="high">عالية</mat-option>
            <mat-option value="medium">متوسطة</mat-option>
            <mat-option value="low">منخفضة</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="issues" class="w-full">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>العنوان</th>
            <td mat-cell *matCellDef="let issue">{{ issue.title }}</td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>المشروع</th>
            <td mat-cell *matCellDef="let issue">{{ issue.projectId || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="reportedBy">
            <th mat-header-cell *matHeaderCellDef>مُبلغ</th>
            <td mat-cell *matCellDef="let issue">{{ issue.reportedBy }}</td>
          </ng-container>

          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>مُسند إلى</th>
            <td mat-cell *matCellDef="let issue">{{ issue.assignedTo || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>الأولوية</th>
            <td mat-cell *matCellDef="let issue">
              <mat-chip [color]="getPriorityColor(issue.priority)" selected>
                {{ getPriorityLabel(issue.priority) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let issue">
              <mat-chip [color]="getStatusColor(issue.status)" selected>
                {{ getStatusLabel(issue.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="comments">
            <th mat-header-cell *matHeaderCellDef>التعليقات</th>
            <td mat-cell *matCellDef="let issue">{{ issue.comments.length }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let issue">
              <button mat-icon-button [routerLink]="[issue.id]" color="primary">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="resolveIssue(issue)" *ngIf="issue.status === 'open' || issue.status === 'in_progress'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteIssue(issue)" color="warn">
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
export class IssuesComponent implements OnInit {
  displayedColumns = ['title', 'project', 'reportedBy', 'assignedTo', 'priority', 'status', 'comments', 'actions'];
  issues: Issue[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus: IssueStatus | '' = '';
  filterPriority: IssuePriority | '' = '';
  criticalCount = 0;
  highCount = 0;
  openCount = 0;
  resolvedCount = 0;
  totalCount = 0;

  constructor(private issueService: IssueService) {}

  ngOnInit() {
    this.loadIssues();
  }

  loadIssues() {
    this.issueService.getIssues({
      page: this.page,
      limit: this.pageSize,
      status: this.filterStatus || undefined,
      priority: this.filterPriority || undefined
    }).subscribe(response => {
      this.issues = response.data;
      this.total = response.total;
    });

    this.issueService.getIssues({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.criticalCount = response.criticalCount;
      this.openCount = response.openCount;
      this.resolvedCount = response.data.filter(i => i.status === 'resolved').length;
      this.highCount = response.data.filter(i => i.priority === 'high').length;
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadIssues();
  }

  getPriorityColor(priority: IssuePriority): string {
    switch (priority) {
      case 'low': return '';
      case 'medium': return 'primary';
      case 'high': return 'accent';
      case 'critical': return 'warn';
      default: return '';
    }
  }

  getPriorityLabel(priority: IssuePriority): string {
    const labels: Record<IssuePriority, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة'
    };
    return labels[priority] || priority;
  }

  getStatusColor(status: IssueStatus): string {
    switch (status) {
      case 'open': return 'warn';
      case 'in_progress': return 'primary';
      case 'resolved': return 'accent';
      case 'closed': return 'accent';
      case 'reopened': return '';
      default: return '';
    }
  }

  getStatusLabel(status: IssueStatus): string {
    const labels: Record<IssueStatus, string> = {
      open: 'مفتوح',
      in_progress: 'قيد التنفيذ',
      resolved: 'محلول',
      closed: 'مُغلق',
      reopened: 'مُعاد فتحه'
    };
    return labels[status] || status;
  }

  resolveIssue(issue: Issue) {
    this.issueService.resolveIssue(issue.id).subscribe(() => {
      this.loadIssues();
    });
  }

  deleteIssue(issue: Issue) {
    if (confirm('حذف هذه المشكلة؟')) {
      this.issueService.deleteIssue(issue.id).subscribe(() => {
        this.loadIssues();
      });
    }
  }
}