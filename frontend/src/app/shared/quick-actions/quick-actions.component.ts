import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="quick-actions">
      <button mat-fab color="primary" [matMenuTriggerFor]="actionsMenu" class="fab-button">
        <mat-icon>add</mat-icon>
      </button>
      
      <mat-menu #actionsMenu="matMenu" class="quick-actions-menu">
        <div class="menu-header">
          <mat-icon>bolt</mat-icon>
          <span>إجراءات سريعة</span>
        </div>
        <mat-divider></mat-divider>
        
        @for (action of quickActions; track action.label) {
          <button mat-menu-item [routerLink]="action.route">
            <mat-icon [style.color]="action.color">{{ action.icon }}</mat-icon>
            <span>{{ action.label }}</span>
          </button>
        }
      </mat-menu>
    </div>

    <div class="floating-actions">
      @for (action of floatingActions; track action.label) {
        <button mat-mini-fab [routerLink]="action.route" [matTooltip]="action.label" [style.background]="action.color">
          <mat-icon>{{ action.icon }}</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .quick-actions {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 100;
    }

    .fab-button {
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .floating-actions {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 100;
    }

    .floating-actions button {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class QuickActionsComponent {
  quickActions: QuickAction[] = [
    { icon: 'person_add', label: 'عميل جديد', route: '/clients?new=true', color: '#8b5cf6' },
    { icon: 'construction', label: 'مشروع جديد', route: '/projects?new=true', color: '#0ea5e9' },
    { icon: 'home_work', label: 'وحدة جديدة', route: '/units?new=true', color: '#ec4899' },
    { icon: 'description', label: 'عقد جديد', route: '/contracts?new=true', color: '#22c55e' },
    { icon: 'person', label: 'مقاول جديد', route: '/contractors?new=true', color: '#f59e0b' },
    { icon: 'inventory_2', label: 'صنف جديد', route: '/inventory?new=true', color: '#6366f1' },
    { icon: 'attach_money', label: 'عملية محاسبية', route: '/accounting?new=true', color: '#14b8a6' },
  ];

  floatingActions: QuickAction[] = [
    { icon: 'dashboard', label: 'لوحة التحكم', route: '/dashboard', color: '#0ea5e9' },
    { icon: 'notifications', label: 'الإشعارات', route: '/notifications', color: '#f59e0b' },
  ];
}