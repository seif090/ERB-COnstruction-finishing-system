import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { GlobalSearchComponent } from './shared/global-search/global-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    GlobalSearchComponent,
  ],
  template: `
    <div class="app-container" [class.dark-theme]="themeService.isDarkMode()">
      @if (authService.isAuthenticated()) {
        <mat-toolbar class="navbar">
          <button mat-icon-button (click)="toggleSidenav()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          
          <div class="logo">
            <mat-icon class="logo-icon">construction</mat-icon>
            <span class="logo-text">ERB</span>
          </div>

          <div class="spacer"></div>

          <button mat-icon-button [matMenuTriggerFor]="langMenu" matTooltip="اللغة">
            <mat-icon>language</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="setLanguage('ar')">
              <mat-icon>check</mat-icon>
              <span>العربية</span>
            </button>
            <button mat-menu-item (click)="setLanguage('en')">
              <mat-icon>check</mat-icon>
              <span>English</span>
            </button>
          </mat-menu>

          <button mat-icon-button [matMenuTriggerFor]="themeMenu" matTooltip="المظهر">
            <mat-icon>{{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
          <mat-menu #themeMenu="matMenu">
            <button mat-menu-item (click)="themeService.toggleDarkMode()">
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              <span>تغيير المظهر</span>
            </button>
          </mat-menu>

          <button mat-icon-button [matMenuTriggerFor]="notifMenu" [matBadge]="notificationService.unreadCount()" matBadgeColor="warn" routerLink="/notifications">
            <mat-icon>notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu">
            <div class="notif-header">الإشعارات</div>
            <button mat-menu-item routerLink="/notifications">
              <mat-icon>visibility</mat-icon>
              <span>عرض الكل</span>
            </button>
          </mat-menu>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <mat-icon>person</mat-icon>
              <span>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>تسجيل الخروج</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="side" [opened]="sidenavOpened()" class="sidenav">
            <mat-nav-list>
              @for (item of menuItems; track item.route) {
                <a mat-list-item 
                   [routerLink]="item.route" 
                   routerLinkActive="active-link"
                   [matTooltip]="item.label"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                  <span matListItemTitle>{{ item.label }}</span>
                </a>
              }
            </mat-nav-list>
          </mat-sidenav>

          <mat-sidenav-content class="main-content">
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
      } @else {
        <router-outlet></router-outlet>
      }
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: var(--surface-color);
      color: var(--text-primary);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .menu-btn {
      margin-left: 8px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 16px;
    }

    .logo-icon {
      color: var(--primary-color);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .spacer {
      flex: 1;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 260px;
      background: var(--surface-color);
      border-left: 1px solid var(--border-color);
    }

    .main-content {
      background: var(--background-color);
      padding: 24px;
    }

    .active-link {
      background: linear-gradient(90deg, var(--primary-color) 0%, rgba(14, 165, 233, 0.1) 100%);
      color: var(--primary-color) !important;
      border-right: 3px solid var(--primary-color);
    }

    .active-link mat-icon {
      color: var(--primary-color);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
    }

    .notif-header {
      padding: 12px 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    ::ng-deep .mat-mdc-menu-panel {
      min-width: 180px !important;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  sidenavOpened = signal(true);

  menuItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'لوحة التحكم' },
    { route: '/calendar', icon: 'calendar_month', label: 'التقويم' },
    { route: '/clients', icon: 'people', label: 'العملاء' },
    { route: '/leads', icon: 'trending_up', label: 'العملاء المحتملون' },
    { route: '/projects', icon: 'construction', label: 'المشاريع' },
    { route: '/tasks', icon: 'task_alt', label: 'المهام' },
    { route: '/work-orders', icon: 'assignment', label: 'أوامر العمل' },
    { route: '/material-requests', icon: 'shopping_cart', label: 'طلبات المواد' },
    { route: '/purchase-orders', icon: 'shopping_bag', label: 'أوامر الشراء' },
    { route: '/rfqs', icon: 'request_quote', label: 'طلبات عروض الأسعار' },
    { route: '/contractors', icon: 'handyman', label: 'المقاولين' },
    { route: '/subcontractor-contracts', icon: 'gavel', label: 'عقود الباطن' },
    { route: '/employees', icon: 'badge', label: 'الموظفين' },
    { route: '/time-tracking', icon: 'schedule', label: 'تتبع الوقت' },
    { route: '/units', icon: 'home_work', label: 'العقارات' },
    { route: '/contracts', icon: 'description', label: 'العقود' },
    { route: '/suppliers', icon: 'local_shipping', label: 'الموردين' },
    { route: '/equipment', icon: 'precision_manufacturing', label: 'المعدات' },
    { route: '/site-inspections', icon: 'fact_check', label: 'التفتيش الميداني' },
    { route: '/warranties', icon: 'verified_user', label: 'الضمانات' },
    { route: '/quality-control', icon: 'check_circle', label: 'ضبط الجودة' },
    { route: '/safety', icon: 'health_and_safety', label: 'السلامة المهنية' },
    { route: '/issues', icon: 'bug_report', label: 'المشاكل' },
    { route: '/project-budgeting', icon: 'attach_money', label: 'الميزانية' },
    { route: '/documents', icon: 'folder', label: 'الوثائق' },
    { route: '/expenses', icon: 'payments', label: 'المصروفات' },
    { route: '/inventory', icon: 'inventory_2', label: 'المخزن' },
    { route: '/accounting', icon: 'account_balance', label: 'المحاسبة' },
    { route: '/reports', icon: 'analytics', label: 'التقارير' },
    { route: '/notifications', icon: 'notifications', label: 'الإشعارات' },
    { route: '/settings', icon: 'settings', label: 'الإعدادات' },
  ];

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      this.themeService.setDarkMode(true);
    }
  }

  toggleSidenav() {
    this.sidenavOpened.update(v => !v);
  }

  setLanguage(lang: string) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  logout() {
    this.authService.logout();
  }
}