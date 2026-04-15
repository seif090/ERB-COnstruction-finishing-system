import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardStats, RevenueChartData, RecentActivity } from '@core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">لوحة التحكم</h1>
          <p class="page-subtitle">مرحباً بك في نظام إدارة التشطيبات والعقارات</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-icon class="spinner">sync</mat-icon>
          <p>جاري تحميل البيانات...</p>
        </div>
      } @else {
        <div class="dashboard-grid">
          <mat-card class="stat-card">
            <div class="stat-icon projects">
              <mat-icon>construction</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.totalProjects || 0 }}</span>
              <span class="stat-label">إجمالي المشاريع</span>
            </div>
            <div class="stat-footer">
              <span class="stat-badge active">{{ stats()?.activeProjects || 0 }} نشط</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon clients">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.totalClients || 0 }}</span>
              <span class="stat-label">العملاء</span>
            </div>
            <div class="stat-footer">
              <span class="stat-badge success">+{{ stats()?.newClientsThisMonth || 0 }} هذا الشهر</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon revenue">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatCurrency(stats()?.totalRevenue || 0) }}</span>
              <span class="stat-label">إجمالي الإيرادات</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon profit">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatCurrency(stats()?.netProfit || 0) }}</span>
              <span class="stat-label">صافي الربح</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon units">
              <mat-icon>home_work</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.availableUnits || 0 }}</span>
              <span class="stat-label">وحدات متاحة</span>
            </div>
            <div class="stat-footer">
              <span class="stat-badge info">{{ stats()?.totalUnits || 0 }} إجمالي</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon payments">
              <mat-icon>payment</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats()?.pendingPayments || 0 }}</span>
              <span class="stat-label">مدفوعات معلقة</span>
            </div>
            <div class="stat-footer">
              @if (stats()?.overduePayments && stats()!.overduePayments > 0) {
                <span class="stat-badge danger">{{ stats()?.overduePayments }} متأخرة</span>
              }
            </div>
          </mat-card>
        </div>

        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>الإيرادات والمصروفات</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [type]="barChartType"
                  [data]="barChartData"
                  [options]="barChartOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>حالة المشاريع</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container doughnut">
                <canvas baseChart
                  [type]="doughnutChartType"
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="activity-section">
          <mat-card class="activity-card">
            <mat-card-header>
              <mat-card-title>النشاط الأخير</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                @for (activity of recentActivity(); track activity.id) {
                  <div class="activity-item">
                    <div class="activity-icon" [class]="activity.type.toLowerCase()">
                      <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                    </div>
                    <div class="activity-content">
                      <p class="activity-title">{{ activity.description }}</p>
                      <span class="activity-time">{{ formatDate(activity.createdAt) }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <mat-icon>inbox</mat-icon>
                    <p>لا يوجد نشاط حديث</p>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: var(--text-secondary);
    }

    .spinner {
      font-size: 48px;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .stat-icon.projects { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
    .stat-icon.clients { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .stat-icon.revenue { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .stat-icon.profit { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-icon.units { background: linear-gradient(135deg, #ec4899, #db2777); }
    .stat-icon.payments { background: linear-gradient(135deg, #6366f1, #4f46e5); }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-badge {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .stat-badge.active { background: #dbeafe; color: #0284c7; }
    .stat-badge.success { background: #dcfce7; color: #16a34a; }
    .stat-badge.info { background: #dbeafe; color: #2563eb; }
    .stat-badge.danger { background: #fee2e2; color: #dc2626; }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .chart-card {
      border-radius: 16px;
    }

    .chart-container {
      height: 300px;
      position: relative;
    }

    .chart-container.doughnut {
      height: 280px;
      display: flex;
      justify-content: center;
    }

    .activity-card {
      border-radius: 16px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      background: var(--background-color);
      transition: background 0.2s ease;
    }

    .activity-item:hover {
      background: var(--border-color);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .activity-icon.project { background: #dbeafe; color: #0284c7; }
    .activity-icon.client { background: #f3e8ff; color: #9333ea; }
    .activity-icon.contract { background: #dcfce7; color: #16a34a; }
    .activity-icon.payment { background: #fef3c7; color: #d97706; }
    .activity-icon.inventory { background: #fee2e2; color: #dc2626; }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentActivity = signal<RecentActivity[]>([]);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.dashboardService.getRecentActivity(5).subscribe({
      next: (data) => this.recentActivity.set(data),
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      PROJECT: 'construction',
      CLIENT: 'person',
      CONTRACT: 'description',
      PAYMENT: 'payment',
      INVENTORY: 'inventory_2',
    };
    return icons[type] || 'info';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}