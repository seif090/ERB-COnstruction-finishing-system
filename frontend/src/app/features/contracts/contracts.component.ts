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
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ContractService } from '@core/services/contract.service';
import { ClientService } from '@core/services/client.service';
import { Contract, CreateContractRequest } from '@core/models/contract.model';
import { Client } from '@core/models/client.model';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule, MatDialogModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">العقود</h1>
          <p class="page-subtitle">إدارة عقود التشطيب والبيع والإيجار</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()"><mat-icon>add</mat-icon> عقد جديد</button>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>بحث</mat-label><input matInput [(ngModel)]="searchText" (input)="loadContracts()" placeholder="رقم أو عنوان العقد"><mat-icon matPrefix>search</mat-icon></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>النوع</mat-label>
            <mat-select [(ngModel)]="typeFilter" (selectionChange)="loadContracts()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="FINISHING">تشطيب</mat-option>
              <mat-option value="SALES">بيع</mat-option>
              <mat-option value="RENTAL">إيجار</mat-option>
              <mat-option value="MAINTENANCE">صيانة</mat-option>
              <mat-option value="CONSULTATION">استشارة</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>الحالة</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadContracts()">
              <mat-option value="">الكل</mat-option>
              <mat-option value="DRAFT">مسودة</mat-option>
              <mat-option value="ACTIVE">نشط</mat-option>
              <mat-option value="EXPIRED">منتهي</mat-option>
              <mat-option value="COMPLETED">مكتمل</mat-option>
              <mat-option value="TERMINATED">م终止</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="contractNumber">
            <th mat-header-cell *matHeaderCellDef>رقم العقد</th>
            <td mat-cell *matCellDef="let contract"><span class="contract-number">{{ contract.contractNumber }}</span></td>
          </ng-container>
          <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>العنوان</th><td mat-cell *matCellDef="let contract">{{ contract.title }}</td></ng-container>
          <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>النوع</th><td mat-cell *matCellDef="let contract"><mat-chip>{{ getTypeLabel(contract.type) }}</mat-chip></td></ng-container>
          <ng-container matColumnDef="client"><th mat-header-cell *matHeaderCellDef>العميل</th><td mat-cell *matCellDef="let contract">{{ contract.client?.firstName }} {{ contract.client?.lastName }}</td></ng-container>
          <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef>القيمة</th><td mat-cell *matCellDef="let contract">{{ formatCurrency(contract.contractValue) }}</td></ng-container>
          <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef>المدفوع</th><td mat-cell *matCellDef="let contract">{{ formatCurrency(contract.paidAmount) }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>الحالة</th><td mat-cell *matCellDef="let contract"><span class="status-badge" [class]="getStatusClass(contract.status)">{{ getStatusLabel(contract.status) }}</span></td></ng-container>
          <ng-container matColumnDef="endDate"><th mat-header-cell *matHeaderCellDef>تاريخ الانتهاء</th><td mat-cell *matCellDef="let contract">{{ formatDate(contract.endDate) }}</td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>الإجراءات</th><td mat-cell *matCellDef="let contract"><button mat-icon-button [routerLink]="['/contracts', contract.id]"><mat-icon>visibility</mat-icon></button><button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button><mat-menu #menu="matMenu"><button mat-menu-item (click)="openDialog(contract)"><mat-icon>edit</mat-icon><span>تعديل</span></button><button mat-menu-item (click)="generatePdf(contract.id)"><mat-icon>picture_as_pdf</mat-icon><span>تحميل PDF</span></button><button mat-menu-item (click)="deleteContract(contract.id)"><mat-icon>delete</mat-icon><span>حذف</span></button></mat-menu></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header"><h2>{{ editingContract() ? 'تعديل عقد' : 'عقد جديد' }}</h2><button mat-icon-button (click)="closeDialog()"><mat-icon>close</mat-icon></button></div>
          <form [formGroup]="contractForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width"><mat-label>عنوان العقد</mat-label><input matInput formControlName="title"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>النوع</mat-label><mat-select formControlName="type"><mat-option value="FINISHING">تشطيب</mat-option><mat-option value="SALES">بيع</mat-option><mat-option value="RENTAL">إيجار</mat-option><mat-option value="MAINTENANCE">صيانة</mat-option><mat-option value="CONSULTATION">استشارة</mat-option></mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>العميل</mat-label><mat-select formControlName="clientId">@for (client of clients(); track client.id) {<mat-option [value]="client.id">{{ client.firstName }} {{ client.lastName }}</mat-option>}</mat-select></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>قيمة العقد</mat-label><input matInput formControlName="contractValue" type="number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>تاريخ البدء</mat-label><input matInput formControlName="startDate" type="date"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>تاريخ الانتهاء</mat-label><input matInput formControlName="endDate" type="date"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>الشروط والأحكام</mat-label><textarea matInput formControlName="conditions" rows="3"></textarea></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>ملاحظات</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field>
            </div>
            <div class="dialog-actions"><button mat-button type="button" (click)="closeDialog()">إلغاء</button><button mat-flat-button color="primary" type="submit" [disabled]="contractForm.invalid">{{ editingContract() ? 'تعديل' : 'إضافة' }}</button></div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; padding: 16px; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 180px; flex: 1; }
    .table-card { border-radius: 16px; overflow: hidden; }
    table { width: 100%; }
    .contract-number { font-weight: 600; color: var(--primary-color); }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-badge.draft { background: #f1f5f9; color: #64748b; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.expired { background: #fee2e2; color: #dc2626; }
    .status-badge.completed { background: #dbeafe; color: #2563eb; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-content { background: var(--surface-color); border-radius: 16px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
    .dialog-header h2 { margin: 0; font-size: 20px; }
    form { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
  `]
})
export class ContractsComponent implements OnInit {
  displayedColumns = ['contractNumber', 'title', 'type', 'client', 'value', 'paid', 'status', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<Contract>();
  searchText = ''; typeFilter = ''; statusFilter = '';
  showDialog = signal(false);
  editingContract = signal<Contract | null>(null);
  clients = signal<Client[]>([]);
  contractForm: FormGroup;

  constructor(private contractService: ContractService, private clientService: ClientService, private fb: FormBuilder) {
    this.contractForm = this.fb.group({
      title: ['', Validators.required],
      type: ['FINISHING', Validators.required],
      clientId: ['', Validators.required],
      contractValue: [0, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      conditions: [''],
      notes: [''],
    });
  }

  ngOnInit() { this.loadClients(); this.loadContracts(); }

  loadClients() { this.clientService.getClients({ limit: 100 }).subscribe({ next: (res) => this.clients.set(res.data) }); }
  loadContracts() { this.contractService.getContracts({ search: this.searchText, type: this.typeFilter as any, status: this.statusFilter as any, page: 1, limit: 100 }).subscribe({ next: (res) => this.dataSource.data = res.data }); }

  openDialog(contract?: Contract) {
    if (contract) { this.editingContract.set(contract); this.contractForm.patchValue({ ...contract, startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '', endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '' }); }
    else { this.editingContract.set(null); this.contractForm.reset({ type: 'FINISHING', contractValue: 0 }); }
    this.showDialog.set(true);
  }

  closeDialog() { this.showDialog.set(false); this.editingContract.set(null); this.contractForm.reset({ type: 'FINISHING' }); }

  onSubmit() {
    if (this.contractForm.invalid) return;
    const data: CreateContractRequest = this.contractForm.value;
    if (this.editingContract()) { this.contractService.updateContract(this.editingContract()!.id, data).subscribe({ next: () => { this.closeDialog(); this.loadContracts(); } }); }
    else { this.contractService.createContract(data).subscribe({ next: () => { this.closeDialog(); this.loadContracts(); } }); }
  }

  deleteContract(id: string) { if (confirm('هل أنت متأكد من حذف هذا العقد؟')) { this.contractService.deleteContract(id).subscribe({ next: () => this.loadContracts() }); } }

  generatePdf(id: string) { this.contractService.generatePdf(id).subscribe({ next: (blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `contract-${id}.pdf`; a.click(); window.URL.revokeObjectURL(url); } }); }

  getTypeLabel(type: string): string { const labels: Record<string, string> = { FINISHING: 'تشطيب', SALES: 'بيع', RENTAL: 'إيجار', MAINTENANCE: 'صيانة', CONSULTATION: 'استشارة' }; return labels[type] || type; }
  getStatusClass(status: string): string { return status.toLowerCase(); }
  getStatusLabel(status: string): string { const labels: Record<string, string> = { DRAFT: 'مسودة', ACTIVE: 'نشط', EXPIRED: 'منتهي', COMPLETED: 'مكتمل', TERMINATED: 'م终止' }; return labels[status] || status; }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
  formatDate(date: Date): string { return new Date(date).toLocaleDateString('ar-SA'); }
}