import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientService } from '@core/services/client.service';
import { Client, ClientNote, ClientInteraction } from '@core/models/client.model';
import { Project } from '@core/models/project.model';
import { Contract } from '@core/models/contract.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-button routerLink="/clients">
          <mat-icon>arrow_back</mat-icon>
          العودة للعملاء
        </button>
      </div>

      @if (loading()) {
        <div class="loading">جاري التحميل...</div>
      } @else if (client()) {
        <div class="client-profile">
          <mat-card class="profile-card">
            <div class="profile-header">
              <div class="avatar">{{ getInitials(client()!.firstName, client()!.lastName) }}</div>
              <div class="profile-info">
                <h1>{{ client()!.firstName }} {{ client()!.lastName }}</h1>
                <p class="company">{{ client()!.company || 'فردي' }}</p>
                <span class="status-badge" [class]="getStatusClass(client()!.status)">
                  {{ getStatusLabel(client()!.status) }}
                </span>
              </div>
            </div>

            <div class="contact-info">
              <div class="contact-item">
                <mat-icon>email</mat-icon>
                <span>{{ client()!.email }}</span>
              </div>
              <div class="contact-item">
                <mat-icon>phone</mat-icon>
                <span>{{ client()!.phone }}</span>
              </div>
              @if (client()!.altPhone) {
                <div class="contact-item">
                  <mat-icon>smartphone</mat-icon>
                  <span>{{ client()!.altPhone }}</span>
                </div>
              }
              @if (client()!.city) {
                <div class="contact-item">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ client()!.city }}</span>
                </div>
              }
            </div>
          </mat-card>

          <mat-card class="stats-card">
            <div class="stat">
              <mat-icon>construction</mat-icon>
              <div>
                <span class="stat-value">{{ projects().length }}</span>
                <span class="stat-label">مشاريع</span>
              </div>
            </div>
            <div class="stat">
              <mat-icon>description</mat-icon>
              <div>
                <span class="stat-value">{{ contracts().length }}</span>
                <span class="stat-label">عقود</span>
              </div>
            </div>
            <div class="stat">
              <mat-icon>attach_money</mat-icon>
              <div>
                <span class="stat-value">{{ totalRevenue() }}</span>
                <span class="stat-label">إجمالي الإيرادات</span>
              </div>
            </div>
          </mat-card>
        </div>

        <mat-tab-group class="tabs">
          <mat-tab label="المشاريع">
            <div class="tab-content">
              @for (project of projects(); track project.id) {
                <mat-card class="item-card">
                  <div class="item-header">
                    <h3>{{ project.name }}</h3>
                    <span class="badge" [class]="getProjectStatusClass(project.status)">
                      {{ getProjectStatusLabel(project.status) }}
                    </span>
                  </div>
                  <p class="item-desc">{{ project.description || 'لا يوجد وصف' }}</p>
                  <div class="item-progress">
                    <span>التقدم: {{ project.progress }}%</span>
                    <mat-progress-bar mode="determinate" [value]="project.progress"></mat-progress-bar>
                  </div>
                  <div class="item-meta">
                    <span>الميزانية: {{ formatCurrency(project.budget) }}</span>
                    <span>العميل: {{ client()!.firstName }} {{ client()!.lastName }}</span>
                  </div>
                </mat-card>
              } @empty {
                <div class="empty">لا توجد مشاريع</div>
              }
            </div>
          </mat-tab>

          <mat-tab label="العقود">
            <div class="tab-content">
              @for (contract of contracts(); track contract.id) {
                <mat-card class="item-card">
                  <div class="item-header">
                    <h3>{{ contract.title }}</h3>
                    <span class="badge" [class]="getContractStatusClass(contract.status)">
                      {{ getContractStatusLabel(contract.status) }}
                    </span>
                  </div>
                  <div class="item-meta">
                    <span>القيمة: {{ formatCurrency(contract.contractValue) }}</span>
                    <span>مدفوع: {{ formatCurrency(contract.paidAmount) }}</span>
                    <span>متبقي: {{ formatCurrency(contract.remainingAmount) }}</span>
                  </div>
                  <div class="item-meta">
                    <span>من: {{ formatDate(contract.startDate) }}</span>
                    <span>إلى: {{ formatDate(contract.endDate) }}</span>
                  </div>
                </mat-card>
              } @empty {
                <div class="empty">لا توجد عقود</div>
              }
            </div>
          </mat-tab>

          <mat-tab label="الملاحظات">
            <div class="tab-content">
              @for (note of notes(); track note.id) {
                <mat-card class="item-card note">
                  <p>{{ note.content }}</p>
                  <span class="note-date">{{ formatDate(note.createdAt) }}</span>
                </mat-card>
              } @empty {
                <div class="empty">لا توجد ملاحظات</div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .client-profile {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .profile-card, .stats-card {
      border-radius: 16px;
      padding: 24px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #7c3aed);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
    }

    .profile-info h1 {
      margin: 0 0 4px;
      font-size: 24px;
    }

    .company {
      color: var(--text-secondary);
      margin: 0 0 8px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
    }

    .contact-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .stats-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat mat-icon {
      color: var(--primary-color);
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .tabs {
      background: var(--surface-color);
      border-radius: 16px;
    }

    .tab-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-card {
      padding: 16px;
      border-radius: 12px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .item-header h3 {
      margin: 0;
    }

    .item-desc {
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .item-progress {
      margin-bottom: 12px;
    }

    .item-meta {
      display: flex;
      gap: 16px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
    }

    .badge.pending { background: #dbeafe; color: #2563eb; }
    .badge.in_progress { background: #fef3c7; color: #d97706; }
    .badge.completed { background: #dcfce7; color: #16a34a; }
    .badge.active { background: #dcfce7; color: #16a34a; }
    .badge.expired { background: #fee2e2; color: #dc2626; }

    .item-card.note {
      border-right: 3px solid var(--primary-color);
    }

    .note-date {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .empty, .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .client-profile {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  @Input() id!: string;

  loading = signal(true);
  client = signal<Client | null>(null);
  projects = signal<Project[]>([]);
  contracts = signal<Contract[]>([]);
  notes = signal<ClientNote[]>([]);

  totalRevenue = signal(0);

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClient();
  }

  loadClient() {
    this.clientService.getClient(this.id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      LEAD: 'عميل محتمل',
      NEGOTIATION: 'تفاوض',
      ACTIVE: 'نشط',
      INACTIVE: 'غير نشط',
      CLOSED: 'مغلق',
      LOST: 'فشل',
    };
    return labels[status] || status;
  }

  getProjectStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getProjectStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'معلق',
      PLANNING: 'تخطيط',
      IN_PROGRESS: 'قيد التنفيذ',
      ON_HOLD: 'متوقف',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    };
    return labels[status] || status;
  }

  getContractStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getContractStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'مسودة',
      ACTIVE: 'نشط',
      EXPIRED: 'منتهي',
      TERMINATED: 'م终止',
      COMPLETED: 'مكتمل',
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