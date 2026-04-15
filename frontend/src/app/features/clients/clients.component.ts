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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ClientService } from '@core/services/client.service';
import { Client, CreateClientRequest } from '@core/models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">العملاء</h1>
          <p class="page-subtitle">إدارة عملاء الشركة والعملاء المحتملين</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          إضافة عميل
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>بحث</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="اسم أو بريد أو هاتف">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>الحالة</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadClients()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="LEAD">عميل محتمل</mat-option>
              <mat-option value="NEGOTIATION">تفاوض</mat-option>
              <mat-option value="ACTIVE">نشط</mat-option>
              <mat-option value="INACTIVE">غير نشط</mat-option>
              <mat-option value="CLOSED">مغلق</mat-option>
              <mat-option value="LOST">فشل</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>الاسم</th>
            <td mat-cell *matCellDef="let client">
              <div class="client-info">
                <div class="client-avatar">{{ getInitials(client.firstName, client.lastName) }}</div>
                <div>
                  <p class="client-name">{{ client.firstName }} {{ client.lastName }}</p>
                  <p class="client-email">{{ client.email }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>الهاتف</th>
            <td mat-cell *matCellDef="let client">{{ client.phone }}</td>
          </ng-container>

          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef>الشركة</th>
            <td mat-cell *matCellDef="let client">{{ client.company || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>الحالة</th>
            <td mat-cell *matCellDef="let client">
              <span class="status-badge" [class]="getStatusClass(client.status)">
                {{ getStatusLabel(client.status) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>تاريخ التسجيل</th>
            <td mat-cell *matCellDef="let client">{{ formatDate(client.createdAt) }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let client">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="قائمة الإجراءات">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/clients', client.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>عرض التفاصيل</span>
                </button>
                <button mat-menu-item (click)="openDialog(client)">
                  <mat-icon>edit</mat-icon>
                  <span>تعديل</span>
                </button>
                <button mat-menu-item (click)="deleteClient(client.id)">
                  <mat-icon>delete</mat-icon>
                  <span>حذف</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingClient() ? 'تعديل عميل' : 'إضافة عميل جديد' }}</h2>
            <button mat-icon-button (click)="closeDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>الاسم الأول</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الاسم الأخير</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>البريد الإلكتروني</mat-label>
                <input matInput formControlName="email" type="email">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الهاتف</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الهاتف البديل</mat-label>
                <input matInput formControlName="altPhone">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الشركة</mat-label>
                <input matInput formControlName="company">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>المنصب</mat-label>
                <input matInput formControlName="position">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>المصدر</mat-label>
                <mat-select formControlName="source">
                  <mat-option value="">اختر</mat-option>
                  <mat-option value="website">الموقع</mat-option>
                  <mat-option value="referral">إحالة</mat-option>
                  <mat-option value="social">وسائل التواصل</mat-option>
                  <mat-option value="advertisement">إعلان</mat-option>
                  <mat-option value="other">أخرى</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>الحالة</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="LEAD">عميل محتمل</mat-option>
                  <mat-option value="NEGOTIATION">تفاوض</mat-option>
                  <mat-option value="ACTIVE">نشط</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>المدينة</mat-label>
                <input matInput formControlName="city">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>العنوان</mat-label>
                <textarea matInput formControlName="address" rows="2"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>ملاحظات</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">إلغاء</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="clientForm.invalid">
                {{ editingClient() ? 'تعديل' : 'إضافة' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-card {
      margin-bottom: 20px;
      padding: 16px;
    }

    .filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    .table-card {
      border-radius: 16px;
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .client-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #7c3aed);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .client-name {
      font-weight: 600;
      margin: 0;
    }

    .client-email {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.lead { background: #dbeafe; color: #2563eb; }
    .status-badge.negotiation { background: #fef3c7; color: #d97706; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #f1f5f9; color: #64748b; }
    .status-badge.closed { background: #dcfce7; color: #16a34a; }
    .status-badge.lost { background: #fee2e2; color: #dc2626; }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
    }

    form {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
    }
  `]
})
export class ClientsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['name', 'phone', 'company', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Client>();
  
  searchText = '';
  statusFilter = '';
  showDialog = signal(false);
  editingClient = signal<Client | null>(null);
  clientForm: FormGroup;

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      altPhone: [''],
      company: [''],
      position: [''],
      source: [''],
      status: ['LEAD'],
      city: [''],
      address: [''],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients() {
    this.clientService.getClients({
      search: this.searchText,
      status: this.statusFilter as any,
      page: 1,
      limit: 100,
    }).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
      },
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  openDialog(client?: Client) {
    if (client) {
      this.editingClient.set(client);
      this.clientForm.patchValue(client);
    } else {
      this.editingClient.set(null);
      this.clientForm.reset({ status: 'LEAD' });
    }
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingClient.set(null);
    this.clientForm.reset({ status: 'LEAD' });
  }

  onSubmit() {
    if (this.clientForm.invalid) return;

    const data: CreateClientRequest = this.clientForm.value;

    if (this.editingClient()) {
      this.clientService.updateClient(this.editingClient()!.id, data).subscribe({
        next: () => {
          this.closeDialog();
          this.loadClients();
        },
      });
    } else {
      this.clientService.createClient(data).subscribe({
        next: () => {
          this.closeDialog();
          this.loadClients();
        },
      });
    }
  }

  deleteClient(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
      });
    }
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }
}