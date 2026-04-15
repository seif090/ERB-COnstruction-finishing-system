import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ProjectService } from '@core/services/project.service';
import { Project, ProjectStage, Task } from '@core/models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatProgressBarModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-button routerLink="/projects">
          <mat-icon>arrow_back</mat-icon>
          العودة للمشاريع
        </button>
      </div>

      @if (loading()) {
        <div class="loading">جاري التحميل...</div>
      } @else if (project()) {
        <div class="project-header-section">
          <mat-card class="info-card">
            <div class="project-title">
              <h1>{{ project()!.name }}</h1>
              <span class="status-badge" [class]="getStatusClass(project()!.status)">{{ getStatusLabel(project()!.status) }}</span>
            </div>
            <p class="description">{{ project()!.description || 'لا يوجد وصف' }}</p>
            
            <div class="progress-section">
              <div class="progress-label">
                <span>التقدم الإجمالي</span>
                <span class="progress-value">{{ project()!.progress }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="project()!.progress"></mat-progress-bar>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="label">الميزانية</span>
                  <span class="value">{{ formatCurrency(project()!.budget) }}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>trending_up</mat-icon>
                <div>
                  <span class="label">التكلفة الفعلية</span>
                  <span class="value">{{ formatCurrency(project()!.actualCost) }}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <span class="label">تاريخ البدء</span>
                  <span class="value">{{ project()!.startDate ? formatDate(project()!.startDate) : '-' }}</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="label">تاريخ الإنهاء</span>
                  <span class="value">{{ project()!.endDate ? formatDate(project()!.endDate) : '-' }}</span>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <mat-tab-group class="tabs">
          <mat-tab label="المراحل">
            <div class="tab-content">
              @for (stage of stages(); track stage.id) {
                <mat-card class="stage-card">
                  <div class="stage-header">
                    <div class="stage-order">{{ stage.order }}</div>
                    <div class="stage-info">
                      <h3>{{ stage.name }}</h3>
                      <span class="stage-status" [class]="getStageStatusClass(stage.status)">{{ getStageStatusLabel(stage.status) }}</span>
                    </div>
                    <div class="stage-progress">{{ stage.progress }}%</div>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="stage.progress"></mat-progress-bar>
                  <div class="stage-stats">
                    <span>الميزانية: {{ formatCurrency(stage.budget) }}</span>
                    <span>التكلفة: {{ formatCurrency(stage.actualCost) }}</span>
                  </div>
                </mat-card>
              } @empty {
                <div class="empty">لا توجد مراحل</div>
              }
            </div>
          </mat-tab>

          <mat-tab label="المهام">
            <div class="tab-content">
              @for (task of tasks(); track task.id) {
                <mat-card class="task-card">
                  <div class="task-info">
                    <mat-icon [class]="getPriorityClass(task.priority)">{{ getPriorityIcon(task.priority) }}</mat-icon>
                    <div>
                      <h4>{{ task.title }}</h4>
                      <p>{{ task.description || 'لا يوجد وصف' }}</p>
                    </div>
                  </div>
                  <div class="task-meta">
                    <span class="task-status" [class]="getTaskStatusClass(task.status)">{{ getTaskStatusLabel(task.status) }}</span>
                    @if (task.dueDate) {
                      <span>موعد التسليم: {{ formatDate(task.dueDate) }}</span>
                    }
                  </div>
                </mat-card>
              } @empty {
                <div class="empty">لا توجد مهام</div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .project-header-section { margin-bottom: 24px; }
    .info-card { padding: 24px; border-radius: 16px; }
    .project-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .project-title h1 { margin: 0; }
    .status-badge { padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .status-badge.pending { background: #dbeafe; color: #2563eb; }
    .status-badge.planning { background: #f3e8ff; color: #9333ea; }
    .status-badge.in_progress { background: #fef3c7; color: #d97706; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .description { color: var(--text-secondary); margin-bottom: 20px; }
    .progress-section { margin-bottom: 24px; }
    .progress-label { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .progress-value { font-weight: 700; color: var(--primary-color); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-item { display: flex; align-items: center; gap: 12px; }
    .stat-item mat-icon { color: var(--primary-color); }
    .stat-item .label { display: block; font-size: 12px; color: var(--text-secondary); }
    .stat-item .value { font-weight: 600; }
    .tabs { background: var(--surface-color); border-radius: 16px; }
    .tab-content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .stage-card, .task-card { padding: 16px; border-radius: 12px; }
    .stage-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .stage-order { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .stage-info { flex: 1; }
    .stage-info h3 { margin: 0 0 4px; }
    .stage-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; }
    .stage-status.not_started { background: #f1f5f9; color: #64748b; }
    .stage-status.in_progress { background: #fef3c7; color: #d97706; }
    .stage-status.completed { background: #dcfce7; color: #16a34a; }
    .stage-progress { font-weight: 700; color: var(--primary-color); }
    .stage-stats { display: flex; gap: 16px; margin-top: 12px; font-size: 14px; color: var(--text-secondary); }
    .task-card { display: flex; justify-content: space-between; align-items: flex-start; }
    .task-info { display: flex; gap: 12px; }
    .task-info h4 { margin: 0 0 4px; }
    .task-info p { margin: 0; font-size: 13px; color: var(--text-secondary); }
    .task-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .task-status { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .task-status.todo { background: #f1f5f9; color: #64748b; }
    .task-status.in_progress { background: #fef3c7; color: #d97706; }
    .task-status.completed { background: #dcfce7; color: #16a34a; }
    .low { color: #22c55e; }
    .medium { color: #f59e0b; }
    .high { color: #ef4444; }
    .urgent { color: #dc2626; }
    .empty { text-align: center; padding: 40px; color: var(--text-secondary); }
    .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
  `]
})
export class ProjectDetailComponent implements OnInit {
  @Input() id!: string;

  loading = signal(true);
  project = signal<Project | null>(null);
  stages = signal<ProjectStage[]>([]);
  tasks = signal<Task[]>([]);

  constructor(private projectService: ProjectService) {}

  ngOnInit() { this.loadProject(); }

  loadProject() {
    this.projectService.getProject(this.id).subscribe({
      next: (data) => { this.project.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.projectService.getProjectStages(this.id).subscribe({
      next: (data) => this.stages.set(data),
    });
    this.projectService.getProjectTasks(this.id).subscribe({
      next: (data) => this.tasks.set(data),
    });
  }

  getStatusClass(status: string): string { return status.toLowerCase(); }
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { PENDING: 'معلق', PLANNING: 'تخطيط', IN_PROGRESS: 'قيد التنفيذ', ON_HOLD: 'متوقف', COMPLETED: 'مكتمل', CANCELLED: 'ملغي' };
    return labels[status] || status;
  }
  getStageStatusClass(status: string): string { return status.toLowerCase().replace('_', '_'); }
  getStageStatusLabel(status: string): string {
    const labels: Record<string, string> = { NOT_STARTED: 'لم يبدأ', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', ON_HOLD: 'متوقف', CANCELLED: 'ملغي' };
    return labels[status] || status;
  }
  getPriorityClass(priority: string): string { return priority.toLowerCase(); }
  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = { LOW: 'arrow_downward', MEDIUM: 'remove', HIGH: 'arrow_upward', URGENT: 'priority_high' };
    return icons[priority] || 'check_circle';
  }
  getTaskStatusClass(status: string): string { return status.toLowerCase().replace('_', '_'); }
  getTaskStatusLabel(status: string): string {
    const labels: Record<string, string> = { TODO: 'للتنفيذ', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', CANCELLED: 'ملغي' };
    return labels[status] || status;
  }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
  formatDate(date: Date): string { return new Date(date).toLocaleDateString('ar-SA'); }
}