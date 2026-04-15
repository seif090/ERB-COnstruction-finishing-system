import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatDividerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">الإعدادات</h1>
          <p class="page-subtitle">إعدادات النظام والتفضيلات</p>
        </div>
      </div>

      <div class="settings-grid">
        <mat-card class="settings-card">
          <div class="card-header">
            <mat-icon>person</mat-icon>
            <h2>الملف الشخصي</h2>
          </div>
          <div class="card-content">
            <div class="user-info">
              <div class="avatar">{{ getInitials() }}</div>
              <div class="details">
                <h3>{{ user()?.firstName }} {{ user()?.lastName }}</h3>
                <p>{{ user()?.email }}</p>
                <span class="role-badge">{{ getRoleLabel(user()?.role || '') }}</span>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="form-section">
              <mat-form-field appearance="outline"><mat-label>الاسم الأول</mat-label><input matInput [value]="user()?.firstName" disabled></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الاسم الأخير</mat-label><input matInput [value]="user()?.lastName" disabled></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>البريد الإلكتروني</mat-label><input matInput [value]="user()?.email" disabled></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>رقم الهاتف</mat-label><input matInput [value]="user()?.phone || 'غير محدد'" disabled></mat-form-field>
            </div>
          </div>
        </mat-card>

        <mat-card class="settings-card">
          <div class="card-header">
            <mat-icon>palette</mat-icon>
            <h2>المظهر</h2>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">الوضع الداكن</span>
                <span class="setting-desc">تفعيل الوضع الداكن للنظام</span>
              </div>
              <mat-slide-toggle [checked]="themeService.isDarkMode()" (change)="themeService.toggleDarkMode()"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">اللغة</span>
                <span class="setting-desc">اختر لغة الواجهة</span>
              </div>
              <mat-form-field appearance="outline" class="lang-select">
                <mat-select [(ngModel)]="language" (selectionChange)="changeLanguage()">
                  <mat-option value="ar">العربية</mat-option>
                  <mat-option value="en">English</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </mat-card>

        <mat-card class="settings-card">
          <div class="card-header">
            <mat-icon>notifications</mat-icon>
            <h2>الإشعارات</h2>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <div class="setting-info"><span class="setting-label">إشعارات المشاريع</span><span class="setting-desc">تلقي إشعارات بتحديثات المشاريع</span></div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="setting-item">
              <div class="setting-info"><span class="setting-label">إشعارات المدفوعات</span><span class="setting-desc">تلقي إشعارات بمواعيد الدفع</span></div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>
            <mat-divider></mat-divider>
            <div class="setting-item">
              <div class="setting-info"><span class="setting-label">إشعارات العقود</span><span class="setting-desc">تلقي إشعارات بانتهاء العقود</span></div>
              <mat-slide-toggle [checked]="true"></mat-slide-toggle>
            </div>
          </div>
        </mat-card>

        <mat-card class="settings-card">
          <div class="card-header">
            <mat-icon>security</mat-icon>
            <h2>الأمان</h2>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <div class="setting-info"><span class="setting-label">تغيير كلمة المرور</span><span class="setting-desc">تحديث كلمة المرور الخاصة بك</span></div>
              <button mat-stroked-button>تغيير</button>
            </div>
            <mat-divider></mat-divider>
            <div class="setting-item">
              <div class="setting-info"><span class="setting-label">الجلسات النشطة</span><span class="setting-desc">عرض وإدارة الجلسات المفتوحة</span></div>
              <button mat-stroked-button>عرض</button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .settings-card { border-radius: 16px; overflow: hidden; }
    .card-header { display: flex; align-items: center; gap: 12px; padding: 20px; background: var(--background-color); border-bottom: 1px solid var(--border-color); }
    .card-header mat-icon { color: var(--primary-color); }
    .card-header h2 { margin: 0; font-size: 18px; }
    .card-content { padding: 20px; }
    .user-info { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; }
    .details h3 { margin: 0 0 4px; }
    .details p { margin: 0 0 8px; color: var(--text-secondary); font-size: 14px; }
    .role-badge { display: inline-block; padding: 4px 10px; background: #dbeafe; color: #2563eb; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .form-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px; }
    .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
    .setting-info { display: flex; flex-direction: column; }
    .setting-label { font-weight: 500; margin-bottom: 4px; }
    .setting-desc { font-size: 13px; color: var(--text-secondary); }
    .lang-select { width: 140px; }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
    @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .form-section { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent {
  language = 'ar';
  user = this.authService.currentUser;

  constructor(public themeService: ThemeService, private authService: AuthService) {
    const savedLang = localStorage.getItem('language');
    if (savedLang) this.language = savedLang;
  }

  getInitials(): string {
    const u = this.user();
    return u ? `${u.firstName.charAt(0)}${u.lastName.charAt(0)}` : '?';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = { ADMIN: 'مدير', EMPLOYEE: 'موظف', CONTRACTOR: 'مقاول', MANAGER: 'مدير مشاريع', ACCOUNTANT: 'محاسب' };
    return labels[role] || role;
  }

  changeLanguage() {
    localStorage.setItem('language', this.language);
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
  }
}