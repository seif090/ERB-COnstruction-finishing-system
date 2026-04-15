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
import { SafetyService } from '@core/services/safety.service';
import { SafetyIncident, SafetyMeeting, SafetyIncidentType, SafetySeverity, SafetyStatus } from '@core/models/safety.model';

@Component({
  selector: 'app-safety',
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
        <h1 class="text-2xl font-bold">السلامة والصحة المهنية</h1>
        <button mat-raised-button color="primary" (click)="openIncidentDialog()">
          <mat-icon>add</mat-icon>
          حادث جديد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ reportedCount }}</div>
              <div class="text-gray-500">مُبلغ</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ investigatingCount }}</div>
              <div class="text-gray-500">قيد التحقيق</div>
            </div>
          </mat-card-content>
        </mat-card>
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
              <div class="text-2xl font-bold text-green-600">{{ closedCount }}</div>
              <div class="text-gray-500">مُغلق</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ incidentRate }}</div>
              <div class="text-gray-500">معدل الحوادث</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="الحوادث">
          <div class="p-4">
            <div class="mb-4 flex gap-4">
              <mat-form-field appearance="outline" class="w-40">
                <mat-label>النوع</mat-label>
                <mat-select [(ngModel)]="filterType" (selectionChange)="loadIncidents()">
                  <mat-option value="">الكل</mat-option>
                  <mat-option value="near_miss">حادث وشيك</mat-option>
                  <mat-option value="first_aid">اسعافات أولية</mat-option>
                  <mat-option value="recordable">مسجل</mat-option>
                  <mat-option value="lost_time">فقدان وقت</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-40">
                <mat-label>الخطورة</mat-label>
                <mat-select [(ngModel)]="filterSeverity" (selectionChange)="loadIncidents()">
                  <mat-option value="">الكل</mat-option>
                  <mat-option value="low">منخفضة</mat-option>
                  <mat-option value="medium">متوسطة</mat-option>
                  <mat-option value="high">عالية</mat-option>
                  <mat-option value="critical">حرجة</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="mat-elevation-z2 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="incidents" class="w-full">
                <ng-container matColumnDef="incidentNumber">
                  <th mat-header-cell *matHeaderCellDef>رقم الحادث</th>
                  <td mat-cell *matCellDef="let inc">{{ inc.incidentNumber }}</td>
                </ng-container>

                <ng-container matColumnDef="project">
                  <th mat-header-cell *matHeaderCellDef>المشروع</th>
                  <td mat-cell *matCellDef="let inc">{{ inc.projectId }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>النوع</th>
                  <td mat-cell *matCellDef="let inc">
                    <mat-chip>{{ getTypeLabel(inc.type) }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="severity">
                  <th mat-header-cell *matHeaderCellDef>الخطورة</th>
                  <td mat-cell *matCellDef="let inc">
                    <mat-chip [color]="getSeverityColor(inc.severity)" selected>
                      {{ getSeverityLabel(inc.severity) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>الحالة</th>
                  <td mat-cell *matCellDef="let inc">
                    <mat-chip [color]="getStatusColor(inc.status)" selected>
                      {{ getStatusLabel(inc.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>التاريخ</th>
                  <td mat-cell *matCellDef="let inc">{{ inc.incidentDate | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
                  <td mat-cell *matCellDef="let inc">
                    <button mat-icon-button [routerLink]="[inc.id]" color="primary">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="closeIncident(inc)" *ngIf="inc.status !== 'closed'" color="accent">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteIncident(inc)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="incidentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: incidentColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="الاجتماعات">
          <div class="p-4">
            <div class="flex justify-end mb-4">
              <button mat-raised-button color="primary" (click)="addMeeting()">
                <mat-icon>add</mat-icon>
                اجتماع جديد
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (meeting of meetings; track meeting.id) {
                <mat-card class="mat-elevation-z2">
                  <mat-card-content>
                    <h3 class="font-medium">{{ meeting.title }}</h3>
                    <p class="text-sm text-gray-500">{{ meeting.meetingDate | date:'short' }}</p>
                    <p class="text-sm">حضر: {{ meeting.attendees.length }} شخص</p>
                    <mat-chip class="mt-2">{{ meeting.conductedBy }}</mat-chip>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class SafetyComponent implements OnInit {
  incidentColumns = ['incidentNumber', 'project', 'type', 'severity', 'status', 'date', 'actions'];
  incidents: SafetyIncident[] = [];
  meetings: SafetyMeeting[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  filterType: SafetyIncidentType | '' = '';
  filterSeverity: SafetySeverity | '' = '';
  reportedCount = 0;
  investigatingCount = 0;
  criticalCount = 0;
  closedCount = 0;
  incidentRate = 0;

  constructor(private safetyService: SafetyService) {}

  ngOnInit() {
    this.loadIncidents();
    this.loadMeetings();
  }

  loadIncidents() {
    this.safetyService.getIncidents({
      page: this.page,
      limit: this.pageSize,
      type: this.filterType || undefined,
      severity: this.filterSeverity || undefined
    }).subscribe(response => {
      this.incidents = response.data;
      this.total = response.total;
      this.incidentRate = response.incidentRate || 0;
    });

    this.safetyService.getIncidents({ limit: 100 }).subscribe(response => {
      this.reportedCount = response.data.filter(i => i.status === 'reported').length;
      this.investigatingCount = response.data.filter(i => i.status === 'investigating').length;
      this.criticalCount = response.data.filter(i => i.severity === 'critical').length;
      this.closedCount = response.data.filter(i => i.status === 'closed').length;
    });
  }

  loadMeetings() {
    this.safetyService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  getTypeLabel(type: SafetyIncidentType): string {
    const labels: Record<SafetyIncidentType, string> = {
      near_miss: 'حادث وشيك',
      first_aid: 'اسعافات أولية',
      recordable: 'مسجل',
      lost_time: 'فقدان وقت',
      fatality: 'وفاة'
    };
    return labels[type] || type;
  }

  getSeverityColor(severity: SafetySeverity): string {
    switch (severity) {
      case 'low': return '';
      case 'medium': return 'primary';
      case 'high': return 'accent';
      case 'critical': return 'warn';
      default: return '';
    }
  }

  getSeverityLabel(severity: SafetySeverity): string {
    const labels: Record<SafetySeverity, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة'
    };
    return labels[severity] || severity;
  }

  getStatusColor(status: SafetyStatus): string {
    switch (status) {
      case 'reported': return 'warn';
      case 'investigating': return 'primary';
      case 'action_required': return 'accent';
      case 'closed': return 'accent';
      default: return '';
    }
  }

  getStatusLabel(status: SafetyStatus): string {
    const labels: Record<SafetyStatus, string> = {
      reported: 'مُبلغ',
      investigating: 'قيد التحقيق',
      action_required: 'تحتاج إجراء',
      closed: 'مُغلق'
    };
    return labels[status] || status;
  }

  openIncidentDialog() {}
  addMeeting() {}

  closeIncident(inc: SafetyIncident) {
    this.safetyService.closeIncident(inc.id).subscribe(() => {
      this.loadIncidents();
    });
  }

  deleteIncident(inc: SafetyIncident) {
    if (confirm('حذف هذا الحادث؟')) {
      this.safetyService.deleteIncident(inc.id).subscribe(() => {
        this.loadIncidents();
      });
    }
  }
}