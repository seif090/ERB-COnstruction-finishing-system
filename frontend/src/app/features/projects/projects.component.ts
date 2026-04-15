import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectService } from '@core/services/project.service';
import { ClientService } from '@core/services/client.service';
import { Project, CreateProjectRequest } from '@core/models/project.model';
import { Client } from '@core/models/client.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatMenuModule, MatProgressBarModule, MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">المشاريع</h1>
          <p class="page-subtitle">إدارة مشاريع التشطيبات والعقارات</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          مشروع جديد
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>بحث</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="اسم المشروع">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>الحالة</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadProjects()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="PENDING">معلق</mat-option>
              <mat-option value="PLANNING">تخطيط</mat-option>
              <mat-option value="IN_PROGRESS">قيد التنفيذ</mat-option>
              <mat-option value="ON_HOLD">متوقف</mat-option>
              <mat-option value="COMPLETED">مكتمل</mat-option>
              <mat-option value="CANCELLED">ملغي</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>العميل</mat-label>
            <mat-select [(ngModel)]="clientFilter" (selectionChange)="loadProjects()">
              <mat-option value="">الكل</mat-option>
              @for (client of clients(); track client.id) {
                <mat-option [value]="client.id">{{ client.firstName }} {{ client.lastName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="projects-grid">
        @for (project of dataSource.data; track project.id) {
          <mat-card class="project-card">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <span class="status-badge" [class]="getStatusClass(project.status)">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            
            <p class="project-client">
              <mat-icon>person</mat-icon>
              {{ project.client?.firstName }} {{ project.client?.lastName }}
            </p>
            
            @if (project.location) {
              <p class="project-location">
                <mat-icon>location_on</mat-icon>
                {{ project.location }}
              </p>
            }

            <div class="project-progress">
              <div class="progress-header">
                <span>التقدم</span>
                <span>{{ project.progress }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="project.progress"></mat-progress-bar>
            </div>

            <div class="project-stats">
              <div class="stat">
                <span class="label">الميزانية</span>
                <span class="value">{{ formatCurrency(project.budget) }}</span>
              </div>
              <div class="stat">
                <span class="label">التكلفة</span>
                <span class="value">{{ formatCurrency(project.actualCost) }}</span>
              </div>
            </div>

            <div class="project-dates">
              @if (project.startDate) {
                <span>البدء: {{ formatDate(project.startDate) }}</span>
              }
              @if (project.endDate) {
                <span>الإنهاء: {{ formatDate(project.endDate) }}</span>
              }
            </div>

            <div class="project-actions">
              <button mat-icon-button [routerLink]="['/projects', project.id]" matTooltip="عرض">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button (click)="openDialog(project)" matTooltip="تعديل">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="المزيد">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="deleteProject(project.id)">
                  <mat-icon>delete</mat-icon>
                  <span>حذف</span>
                </button>
              </mat-menu>
            </div>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon>construction</mat-icon>
            <p>لا توجد مشاريع</p>
          </div>
        }
      </mat-card>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingProject() ? 'تعديل مشروع' : 'مشروع جديد' }}</h2>
            <button mat-icon-button (click)="closeDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>اسم المشروع</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>الوصف</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>العميل</mat-label>
                <mat-select formControlName="clientId">
                  @for (client of clients(); track client.id) {
                    <mat-option [value]="client.id">{{ client.firstName }} {{ client.lastName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الحالة</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="PENDING">معلق</mat-option>
                  <mat-option value="PLANNING">تخطيط</mat-option>
                  <mat-option value="IN_PROGRESS">قيد التنفيذ</mat-option>
                  <mat-option value="ON_HOLD">متوقف</mat-option>
                  <mat-option value="COMPLETED">مكتمل</mat-option>
                  <mat-option value="CANCELLED">ملغي</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الميزانية</mat-label>
                <input matInput formControlName="budget" type="number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>قيمة العقد</mat-label>
                <input matInput formControlName="contractValue" type="number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>تاريخ البدء</mat-label>
                <input matInput formControlName="startDate" type="date">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>تاريخ الإنهاء</mat-label>
                <input matInput formControlName="endDate" type="date">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الموقع</mat-label>
                <input matInput formControlName="location">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>المساحة (م²)</mat-label>
                <input matInput formControlName="area" type="number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>نسبة الربح (%)</mat-label>
                <input matInput formControlName="profitMargin" type="number">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>ملاحظات</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>

            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">إلغاء</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="projectForm.invalid">
                {{ editingProject() ? 'تعديل' : 'إضافة' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 200px; flex: 1; }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .project-card {
      padding: 20px;
      border-radius: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .project-header h3 { margin: 0; font-size: 18px; }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.pending { background: #dbeafe; color: #2563eb; }
    .status-badge.planning { background: #f3e8ff; color: #9333ea; }
    .status-badge.in_progress { background: #fef3c7; color: #d97706; }
    .status-badge.on_hold { background: #f1f5f9; color: #64748b; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled { background: #fee2e2; color: #dc2626; }

    .project-client, .project-location {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .project-client mat-icon, .project-location mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .project-progress {
      margin: 16px 0;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .project-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }

    .stat { display: flex; flex-direction: column; }
    .stat .label { font-size: 12px; color: var(--text-secondary); }
    .stat .value { font-weight: 600; }

    .project-dates {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .project-actions {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .dialog-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: var(--surface-color);
      border-radius: 16px;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .dialog-header h2 { margin: 0; font-size: 20px; }

    form { padding: 20px; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .full-width { grid-column: 1 / -1; }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class ProjectsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['name', 'client', 'status', 'progress', 'budget', 'actions'];
  dataSource = new MatTableDataSource<Project>();

  searchText = '';
  statusFilter = '';
  clientFilter = '';
  showDialog = signal(false);
  editingProject = signal<Project | null>(null);
  clients = signal<Client[]>([]);

  projectForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      clientId: ['', Validators.required],
      status: ['PENDING'],
      budget: [0, [Validators.required, Validators.min(0)]],
      contractValue: [0],
      startDate: [''],
      endDate: [''],
      location: [''],
      area: [0],
      profitMargin: [0],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients() {
    this.clientService.getClients({ limit: 100 }).subscribe({
      next: (res) => this.clients.set(res.data),
    });
  }

  loadProjects() {
    this.projectService.getProjects({
      search: this.searchText,
      status: this.statusFilter as any,
      clientId: this.clientFilter,
      page: 1,
      limit: 100,
    }).subscribe({
      next: (res) => this.dataSource.data = res.data,
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  openDialog(project?: Project) {
    if (project) {
      this.editingProject.set(project);
      this.projectForm.patchValue({
        ...project,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      this.editingProject.set(null);
      this.projectForm.reset({ status: 'PENDING', budget: 0, contractValue: 0, area: 0, profitMargin: 0 });
    }
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingProject.set(null);
    this.projectForm.reset({ status: 'PENDING', budget: 0, contractValue: 0, area: 0, profitMargin: 0 });
  }

  onSubmit() {
    if (this.projectForm.invalid) return;

    const data: CreateProjectRequest = this.projectForm.value;

    if (this.editingProject()) {
      this.projectService.updateProject(this.editingProject()!.id, data).subscribe({
        next: () => { this.closeDialog(); this.loadProjects(); },
      });
    } else {
      this.projectService.createProject(data).subscribe({
        next: () => { this.closeDialog(); this.loadProjects(); },
      });
    }
  }

  deleteProject(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.loadProjects(),
      });
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'معلق', PLANNING: 'تخطيط', IN_PROGRESS: 'قيد التنفيذ',
      ON_HOLD: 'متوقف', COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }
}