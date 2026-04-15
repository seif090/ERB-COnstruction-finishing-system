import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ContractService } from '@core/services/contract.service';
import { Contract, Payment } from '@core/models/contract.model';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header"><button mat-button routerLink="/contracts"><mat-icon>arrow_back</mat-icon> العودة للعقود</button></div>
      @if (loading()) { <div class="loading">جاري التحميل...</div> }
      @else if (contract()) {
        <div class="contract-detail">
          <mat-card class="info-card">
            <div class="contract-header">
              <div>
                <h1>{{ contract()!.title }}</h1>
                <p class="contract-number">رقم العقد: {{ contract()!.contractNumber }}</p>
              </div>
              <span class="status-badge" [class]="getStatusClass(contract()!.status)">{{ getStatusLabel(contract()!.status) }}</span>
            </div>
            <div class="contract-type"><mat-chip>{{ getTypeLabel(contract()!.type) }}</mat-chip></div>
            <div class="financials">
              <div class="financial-item"><span>قيمة العقد</span><strong>{{ formatCurrency(contract()!.contractValue) }}</strong></div>
              <div class="financial-item"><span>المدفوع</span><strong>{{ formatCurrency(contract()!.paidAmount) }}</strong></div>
              <div class="financial-item"><span>المتبقي</span><strong class="remaining">{{ formatCurrency(contract()!.remainingAmount) }}</strong></div>
            </div>
            <div class="progress-section"><span>نسبة التحصيل: {{ getPaymentPercentage() }}%</span><mat-progress-bar mode="determinate" [value]="getPaymentPercentage()"></mat-progress-bar></div>
          </mat-card>
          <mat-card class="dates-card">
            <h3>معلومات العقد</h3>
            <div class="date-item"><mat-icon>event</mat-icon><div><span>تاريخ البدء</span><strong>{{ formatDate(contract()!.startDate) }}</strong></div></div>
            <div class="date-item"><mat-icon>event_busy</mat-icon><div><span>تاريخ الانتهاء</span><strong>{{ formatDate(contract()!.endDate) }}</strong></div></div>
            <div class="date-item"><mat-icon>person</mat-icon><div><span>العميل</span><strong>{{ contract()!.client?.firstName }} {{ contract()!.client?.lastName }}</strong></div></div>
            @if (contract()!.project) { <div class="date-item"><mat-icon>construction</mat-icon><div><span>المشروع</span><strong>{{ contract()!.project!.name }}</strong></div></div> }
            @if (contract()!.conditions) { <div class="conditions"><h4>الشروط والأحكام</h4><p>{{ contract()!.conditions }}</p></div> }
          </mat-card>
        </div>
        <mat-card class="payments-card">
          <h3>الدفعات</h3>
          @if (payments().length > 0) {
            <table mat-table [dataSource]="payments()">
              <ng-container matColumnDef="paymentNumber"><th mat-header-cell *matHeaderCellDef>رقم الدفعة</th><td mat-cell *matCellDef="let p">{{ p.paymentNumber }}</td></ng-container>
              <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>المبلغ</th><td mat-cell *matCellDef="let p">{{ formatCurrency(p.amount) }}</td></ng-container>
              <ng-container matColumnDef="paidAmount"><th mat-header-cell *matHeaderCellDef>المدفوع</th><td mat-cell *matCellDef="let p">{{ formatCurrency(p.paidAmount) }}</td></ng-container>
              <ng-container matColumnDef="dueDate"><th mat-header-cell *matHeaderCellDef>موعد الدفع</th><td mat-cell *matCellDef="let p">{{ formatDate(p.dueDate) }}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>الحالة</th><td mat-cell *matCellDef="let p"><span class="status-badge" [class]="getPaymentStatusClass(p.status)">{{ getPaymentStatusLabel(p.status) }}</span></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
            </table>
          } @else { <div class="empty">لا توجد دفعات</div> }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .contract-detail { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
    .info-card, .dates-card, .payments-card { padding: 24px; border-radius: 16px; }
    .contract-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .contract-header h1 { margin: 0 0 8px; }
    .contract-number { color: var(--text-secondary); font-size: 14px; }
    .status-badge { padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .status-badge.draft { background: #f1f5f9; color: #64748b; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.expired { background: #fee2e2; color: #dc2626; }
    .contract-type { margin-bottom: 20px; }
    .financials { display: flex; gap: 24px; margin-bottom: 20px; padding: 16px; background: var(--background-color); border-radius: 12px; }
    .financial-item { display: flex; flex-direction: column; }
    .financial-item span { font-size: 12px; color: var(--text-secondary); }
    .financial-item strong { font-size: 18px; }
    .financial-item .remaining { color: var(--primary-color); }
    .progress-section { display: flex; flex-direction: column; gap: 8px; }
    .dates-card h3 { margin: 0 0 16px; }
    .date-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .date-item mat-icon { color: var(--primary-color); }
    .date-item span { display: block; font-size: 12px; color: var(--text-secondary); }
    .conditions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); }
    .conditions h4 { margin: 0 0 8px; font-size: 14px; }
    .conditions p { color: var(--text-secondary); font-size: 13px; margin: 0; white-space: pre-line; }
    .payments-card { border-radius: 16px; }
    .payments-card h3 { margin: 0 0 16px; }
    table { width: 100%; }
    .empty { text-align: center; padding: 40px; color: var(--text-secondary); }
    .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .status-badge.pending { background: #fef3c7; color: #d97706; }
    .status-badge.paid { background: #dcfce7; color: #16a34a; }
    .status-badge.overdue { background: #fee2e2; color: #dc2626; }
    @media (max-width: 768px) { .contract-detail { grid-template-columns: 1fr; } }
  `]
})
export class ContractDetailComponent implements OnInit {
  @Input() id!: string;
  loading = signal(true);
  contract = signal<Contract | null>(null);
  payments = signal<Payment[]>([]);
  paymentColumns = ['paymentNumber', 'amount', 'paidAmount', 'dueDate', 'status'];

  constructor(private contractService: ContractService) {}

  ngOnInit() { this.loadContract(); }

  loadContract() {
    this.contractService.getContract(this.id).subscribe({ next: (data) => { this.contract.set(data); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.contractService.getContractPayments(this.id).subscribe({ next: (data) => this.payments.set(data) });
  }

  getPaymentPercentage(): number { const c = this.contract(); if (!c || c.contractValue === 0) return 0; return Math.round((c.paidAmount / c.contractValue) * 100); }
  getStatusClass(status: string): string { return status.toLowerCase(); }
  getStatusLabel(status: string): string { const labels: Record<string, string> = { DRAFT: 'مسودة', ACTIVE: 'نشط', EXPIRED: 'منتهي', COMPLETED: 'مكتمل', TERMINATED: 'م终止' }; return labels[status] || status; }
  getTypeLabel(type: string): string { const labels: Record<string, string> = { FINISHING: 'تشطيب', SALES: 'بيع', RENTAL: 'إيجار', MAINTENANCE: 'صيانة', CONSULTATION: 'استشارة' }; return labels[type] || type; }
  getPaymentStatusClass(status: string): string { return status.toLowerCase(); }
  getPaymentStatusLabel(status: string): string { const labels: Record<string, string> = { PENDING: 'معلق', PAID: 'مدفوع', OVERDUE: 'متأخر', CANCELLED: 'ملغي', PARTIALLY_PAID: 'مدفوع جزئياً' }; return labels[status] || status; }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
  formatDate(date: Date): string { return new Date(date).toLocaleDateString('ar-SA'); }
}