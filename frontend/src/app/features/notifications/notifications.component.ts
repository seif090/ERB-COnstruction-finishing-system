import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService } from '@core/services/notification.service';
import { Notification, PaginatedNotifications } from '@core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatMenuModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">الإشعارات</h1>
          <p class="page-subtitle">جميع الإشعارات والتنبيهات</p>
        </div>
        <div class="header-actions">
          <button mat-button (click)="markAllAsRead()">
            <mat-icon>done_all</mat-icon>
            تحديد الكل كمقروء
          </button>
        </div>
      </div>

      <mat-card class="filter-card">
        <mat-tab-group>
          <mat-tab label="الكل">
            <div class="notifications-list">
              @for (notification of notifications(); track notification.id) {
                <div class="notification-item" [class.unread]="!notification.isRead" (click)="markAsRead(notification)">
                  <div class="notification-icon" [class]="notification.type.toLowerCase()">
                    <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
                  </div>
                  <div class="notification-content">
                    <h4>{{ notification.title }}</h4>
                    <p>{{ notification.message }}</p>
                    <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
                  </div>
                  <div class="notification-actions">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      @if (notification.link) {
                        <button mat-menu-item [routerLink]="notification.link">
                          <mat-icon>open_in_new</mat-icon>
                          <span>فتح</span>
                        </button>
                      }
                      <button mat-menu-item (click)="deleteNotification(notification.id)">
                        <mat-icon>delete</mat-icon>
                        <span>حذف</span>
                      </button>
                    </mat-menu>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <mat-icon>notifications_none</mat-icon>
                  <p>لا توجد إشعارات</p>
                </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="غير مقروء">
            <div class="notifications-list">
              @for (notification of unreadNotifications(); track notification.id) {
                <div class="notification-item unread" (click)="markAsRead(notification)">
                  <div class="notification-icon" [class]="notification.type.toLowerCase()">
                    <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
                  </div>
                  <div class="notification-content">
                    <h4>{{ notification.title }}</h4>
                    <p>{{ notification.message }}</p>
                    <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <mat-icon>notifications_none</mat-icon>
                  <p>لا توجد إشعارات غير مقروءة</p>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 8px; }
    .filter-card { border-radius: 16px; }
    .notifications-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      background: var(--background-color);
      transition: all 0.2s;
      cursor: pointer;
    }
    .notification-item:hover { background: var(--border-color); }
    .notification-item.unread { border-right: 3px solid var(--primary-color); background: rgba(14, 165, 233, 0.05); }
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .notification-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .notification-icon.info { background: #dbeafe; color: #2563eb; }
    .notification-icon.success { background: #dcfce7; color: #16a34a; }
    .notification-icon.warning { background: #fef3c7; color: #d97706; }
    .notification-icon.error { background: #fee2e2; color: #dc2626; }
    .notification-icon.payment_due { background: #f3e8ff; color: #9333ea; }
    .notification-icon.project_update { background: #dbeafe; color: #0ea5e9; }
    .notification-icon.contract_expiry { background: #fef3c7; color: #f59e0b; }
    .notification-content { flex: 1; }
    .notification-content h4 { margin: 0 0 4px; font-size: 14px; }
    .notification-content p { margin: 0 0 8px; color: var(--text-secondary); font-size: 13px; }
    .notification-time { font-size: 11px; color: var(--text-secondary); }
    .notification-actions { opacity: 0; transition: opacity 0.2s; }
    .notification-item:hover .notification-actions { opacity: 1; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (response: PaginatedNotifications) => this.notifications.set(response.data),
    });
  }

  unreadNotifications() {
    return this.notifications().filter(n => !n.read);
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          this.notifications.update(list => 
            list.map(n => n.id === notification.id ? { ...n, read: true } : n)
          );
        },
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => 
          list.map(n => ({ ...n, isRead: true }))
        );
      },
    });
  }

  deleteNotification(id: string) {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.id !== id));
      },
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      INFO: 'info',
      SUCCESS: 'check_circle',
      WARNING: 'warning',
      ERROR: 'error',
      PAYMENT_DUE: 'payment',
      PROJECT_UPDATE: 'construction',
      CONTRACT_EXPIRY: 'schedule',
    };
    return icons[type] || 'notifications';
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