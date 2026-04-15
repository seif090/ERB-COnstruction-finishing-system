import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-bg"></div>
      <div class="login-content">
        <div class="login-header">
          <mat-icon class="logo-icon">construction</mat-icon>
          <h1>ERB</h1>
          <p>نظام إدارة التشطيبات والعقارات</p>
        </div>

        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>تسجيل الدخول</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>البريد الإلكتروني</mat-label>
                <input matInput formControlName="email" type="email" placeholder="example@email.com">
                <mat-icon matPrefix>email</mat-icon>
                @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                  <mat-error>البريد الإلكتروني مطلوب</mat-error>
                }
                @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                  <mat-error>صيغة البريد الإلكتروني غير صحيحة</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>كلمة المرور</mat-label>
                <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>كلمة المرور مطلوبة</mat-error>
                }
              </mat-form-field>

              @if (error()) {
                <div class="error-message">
                  <mat-icon>error</mat-icon>
                  <span>{{ error() }}</span>
                </div>
              }

              <button mat-flat-button color="primary" type="submit" class="login-btn" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  تسجيل الدخول
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="login-footer">
          <p>© 2024 ERB - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .login-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 50%, #0ea5e9 100%);
      background-size: 400% 400%;
      animation: gradientBG 15s ease infinite;
    }

    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .login-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .logo-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
    }

    .login-header h1 {
      font-size: 36px;
      font-weight: 800;
      margin: 10px 0;
    }

    .login-header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .login-card {
      padding: 30px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    mat-card-header {
      justify-content: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fee2e2;
      border-radius: 8px;
      color: #dc2626;
      margin-bottom: 16px;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 8px;
    }

    .login-btn mat-spinner {
      display: inline-block;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      height: 20px;
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
      color: white;
      opacity: 0.8;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal('');
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'حدث خطأ في تسجيل الدخول');
      },
    });
  }
}