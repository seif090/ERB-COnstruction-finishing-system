import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '@core/services/dashboard.service';
import { MonthlyStats } from '@core/models/dashboard.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">التقارير</h1>
          <p class="page-subtitle">تقارير شاملة عن أداء الشركة</p>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>السنة</mat-label>
          <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadData()">
            @for (year of years; track year) {
              <mat-option [value]="year">{{ year }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="reports-grid">
        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>الإيرادات الشهرية</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>bar_chart</mat-icon>
              <p>بيانات الإيرادات الشهرية</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>عدد المشاريع</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-list">
              @for (stat of monthlyStats(); track stat.month) {
                <div class="stat-row">
                  <span class="month">{{ stat.month }}</span>
                  <div class="bar-container">
                    <div class="bar" [style.width.%]="getProjectBarWidth(stat.projects)"></div>
                  </div>
                  <span class="value">{{ stat.projects }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="report-card full-width">
          <mat-card-header>
            <mat-card-title>ملخص العام</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <mat-icon>construction</mat-icon>
                <div>
                  <span class="label">إجمالي المشاريع</span>
                  <strong>{{ totalProjects }}</strong>
                </div>
              </div>
              <div class="summary-item">
                <mat-icon>people</mat-icon>
                <div>
                  <span class="label">عملاء جدد</span>
                  <strong>{{ totalClients }}</strong>
                </div>
              </div>
              <div class="summary-item">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="label">إجمالي الإيرادات</span>
                  <strong>{{ formatCurrency(totalRevenue) }}</strong>
                </div>
              </div>
              <div class="summary-item">
                <mat-icon>trending_up</mat-icon>
                <div>
                  <span class="label">متوسط المشاريع/شهر</span>
                  <strong>{{ avgProjectsPerMonth }}</strong>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reports-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .report-card { border-radius: 16px; padding: 20px; }
    .report-card.full-width { grid-column: 1 / -1; }
    .chart-container { height: 300px; }
    .chart-placeholder { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); }
    .chart-placeholder mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .stats-list { display: flex; flex-direction: column; gap: 12px; }
    .stat-row { display: flex; align-items: center; gap: 12px; }
    .month { width: 80px; font-weight: 500; }
    .bar-container { flex: 1; height: 24px; background: var(--background-color); border-radius: 4px; overflow: hidden; }
    .bar { height: 100%; background: linear-gradient(90deg, #0ea5e9, #0284c7); border-radius: 4px; transition: width 0.3s ease; }
    .value { width: 40px; text-align: left; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .summary-item { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--background-color); border-radius: 12px; }
    .summary-item mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--primary-color); }
    .summary-item .label { display: block; font-size: 12px; color: var(--text-secondary); }
    .summary-item strong { font-size: 24px; }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
    @media (max-width: 768px) { .reports-grid { grid-template-columns: 1fr; } .summary-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class ReportsComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  years = [2024, 2025, 2026];
  monthlyStats = signal<MonthlyStats[]>([]);
  totalProjects = 0; totalClients = 0; totalRevenue = 0; avgProjectsPerMonth = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.dashboardService.getMonthlyStats(this.selectedYear).subscribe({
      next: (data) => {
        this.monthlyStats.set(data);
        this.calculateSummary(data);
      },
    });
  }

  calculateSummary(data: MonthlyStats[]) {
    this.totalProjects = data.reduce((sum, m) => sum + m.projects, 0);
    this.totalClients = data.reduce((sum, m) => sum + m.clients, 0);
    this.totalRevenue = data.reduce((sum, m) => sum + m.revenue, 0);
    this.avgProjectsPerMonth = Math.round(this.totalProjects / 12);
  }

  getProjectBarWidth(projects: number): number {
    const max = Math.max(...this.monthlyStats().map(m => m.projects));
    return max ? (projects / max) * 100 : 0;
  }

  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
}