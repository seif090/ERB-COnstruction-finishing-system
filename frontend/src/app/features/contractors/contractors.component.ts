import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { ContractorService } from '@core/services/contractor.service';
import { Contractor, CreateContractorRequest } from '@core/models/contractor.model';

@Component({
  selector: 'app-contractors',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule, MatChipsModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">المقاولين</h1>
          <p class="page-subtitle">إدارة المقاولين والصنايعية</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          إضافة مقاول
        </button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>بحث</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="loadContractors()" placeholder="اسم أو بريد">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>التخصص</mat-label>
            <mat-select [(ngModel)]="specialtyFilter" (selectionChange)="loadContractors()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="plumbing">سباكة</mat-option>
              <mat-option value="electrical">كهرباء</mat-option>
              <mat-option value="painting">دهان</mat-option>
              <mat-option value="tiling">بلاط</mat-option>
              <mat-option value="carpentry">نجارة</mat-option>
              <mat-option value="aluminum">ألمنيوم</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>الاسم</th>
            <td mat-cell *matCellDef="let contractor">
              <div class="contractor-info">
                <div class="avatar">{{ contractor.name.charAt(0) }}</div>
                <div>
                  <p class="name">{{ contractor.name }}</p>
                  <p class="email">{{ contractor.email }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>الهاتف</th>
            <td mat-cell *matCellDef="let contractor">{{ contractor.phone }}</td>
          </ng-container>

          <ng-container matColumnDef="specialty">
            <th mat-header-cell *matHeaderCellDef>التخصص</th>
            <td mat-cell *matCellDef="let contractor">
              <mat-chip-set>
                @for (spec of contractor.specialty; track spec) {
                  <mat-chip>{{ getSpecialtyLabel(spec) }}</mat-chip>
                }
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="rating">
            <th mat-header-cell *matHeaderCellDef>التقييم</th>
            <td mat-cell *matCellDef="let contractor">
              <div class="rating">
                <mat-icon>star</mat-icon>
                <span>{{ contractor.rating.toFixed(1) }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>الحالة</th>
            <td mat-cell *matCellDef="let contractor">
              <span class="status-badge" [class.active]="contractor.isActive" [class.inactive]="!contractor.isActive">
                {{ contractor.isActive ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
            <td mat-cell *matCellDef="let contractor">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openDialog(contractor)"><mat-icon>edit</mat-icon><span>تعديل</span></button>
                <button mat-menu-item (click)="deleteContractor(contractor.id)"><mat-icon>delete</mat-icon><span>حذف</span></button>
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
            <h2>{{ editingContractor() ? 'تعديل مقاول' : 'إضافة مقاول جديد' }}</h2>
            <button mat-icon-button (click)="closeDialog()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="contractorForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>الاسم</mat-label><input matInput formControlName="name"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>البريد الإلكتروني</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الهاتف</mat-label><input matInput formControlName="phone"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الهاتف البديل</mat-label><input matInput formControlName="altPhone"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>رقم الهوية</mat-label><input matInput formControlName="idNumber"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>سنوات الخبرة</mat-label><input matInput formControlName="experienceYears" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>الأجر اليومي</mat-label><input matInput formControlName="dailyRate" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>التخصص</mat-label>
                <mat-select formControlName="specialty" multiple>
                  <mat-option value="plumbing">سباكة</mat-option>
                  <mat-option value="electrical">كهرباء</mat-option>
                  <mat-option value="painting">دهان</mat-option>
                  <mat-option value="tiling">بلاط</mat-option>
                  <mat-option value="carpentry">نجارة</mat-option>
                  <mat-option value="aluminum">ألمنيوم</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>ملاحظات</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field>
            </div>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">إلغاء</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="contractorForm.invalid">{{ editingContractor() ? 'تعديل' : 'إضافة' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 200px; flex: 1; }
    .table-card { border-radius: 16px; overflow: hidden; }
    table { width: 100%; }
    .contractor-info { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .name { font-weight: 600; margin: 0; }
    .email { font-size: 12px; color: var(--text-secondary); margin: 0; }
    .rating { display: flex; align-items: center; gap: 4px; }
    .rating mat-icon { color: #f59e0b; font-size: 18px; width: 18px; height: 18px; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #f1f5f9; color: #64748b; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: var(--surface-color); border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
    .dialog-header h2 { margin: 0; font-size: 20px; }
    form { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class ContractorsComponent implements OnInit {
  displayedColumns = ['name', 'phone', 'specialty', 'rating', 'status', 'actions'];
  dataSource = new MatTableDataSource<Contractor>();

  searchText = '';
  specialtyFilter = '';
  showDialog = signal(false);
  editingContractor = signal<Contractor | null>(null);
  contractorForm: FormGroup;

  constructor(private contractorService: ContractorService, private fb: FormBuilder) {
    this.contractorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      altPhone: [''],
      idNumber: [''],
      experienceYears: [0],
      dailyRate: [0],
      specialty: [[]],
      notes: [''],
    });
  }

  ngOnInit() { this.loadContractors(); }

  loadContractors() {
    this.contractorService.getContractors({ search: this.searchText, specialty: this.specialtyFilter, page: 1, limit: 100 }).subscribe({
      next: (res) => this.dataSource.data = res.data,
    });
  }

  openDialog(contractor?: Contractor) {
    if (contractor) {
      this.editingContractor.set(contractor);
      this.contractorForm.patchValue(contractor);
    } else {
      this.editingContractor.set(null);
      this.contractorForm.reset({ specialty: [] });
    }
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingContractor.set(null);
    this.contractorForm.reset({ specialty: [] });
  }

  onSubmit() {
    if (this.contractorForm.invalid) return;
    const data: CreateContractorRequest = this.contractorForm.value;
    if (this.editingContractor()) {
      this.contractorService.updateContractor(this.editingContractor()!.id, data).subscribe({ next: () => { this.closeDialog(); this.loadContractors(); } });
    } else {
      this.contractorService.createContractor(data).subscribe({ next: () => { this.closeDialog(); this.loadContractors(); } });
    }
  }

  deleteContractor(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المقاول؟')) {
      this.contractorService.deleteContractor(id).subscribe({ next: () => this.loadContractors() });
    }
  }

  getSpecialtyLabel(spec: string): string {
    const labels: Record<string, string> = { plumbing: 'سباكة', electrical: 'كهرباء', painting: 'دهان', tiling: 'بلاط', carpentry: 'نجارة', aluminum: 'ألمنيوم' };
    return labels[spec] || spec;
  }
}