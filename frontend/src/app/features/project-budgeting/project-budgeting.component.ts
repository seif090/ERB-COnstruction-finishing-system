import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule as MatTableModule2 } from '@angular/material/table';
import { ProjectBudgetService } from '@core/services/project-budget.service';
import { ProjectBudget, CostChange, BudgetStatus } from '@core/models/project-budget.model';

@Component({
  selector: 'app-project-budgeting',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatTableModule2,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">الميزانية التقديرية</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ totalBudget | currency }}</div>
              <div class="text-gray-500">إجمالي الميزانية</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ totalSpent | currency }}</div>
              <div class="text-gray-500">المصروف</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ remainingBudget | currency }}</div>
              <div class="text-gray-500">المتبقي</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="mat-elevation-z2">
          <mat-card-content>
            <div class="text-center">
              <div class="text-2xl font-bold" [class.text-green-600]="budgetUsage <= 80" [class.text-orange-600]="budgetUsage > 80 && budgetUsage <= 100" [class.text-red-600]="budgetUsage > 100">
                {{ budgetUsage }}%
              </div>
              <div class="text-gray-500">نسبة الاستخدام</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="الميزانيات">
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (budget of budgets; track budget.id) {
                <mat-card class="mat-elevation-z2">
                  <mat-card-content>
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h3 class="font-medium">{{ budget.projectId }}</h3>
                        <p class="text-sm text-gray-500">المشروع</p>
                      </div>
                      <mat-chip [color]="getStatusColor(budget.status)" selected>
                        {{ getStatusLabel(budget.status) }}
                      </mat-chip>
                    </div>

                    <div class="space-y-3">
                      <div>
                        <div class="flex justify-between text-sm mb-1">
                          <span>الإجمالي</span>
                          <span>{{ budget.totalBudget | currency }}</span>
                        </div>
                        <mat-progress-bar mode="determinate" [value]="getUsagePercent(budget)" [color]="getUsagePercent(budget) > 100 ? 'warn' : 'accent'"></mat-progress-bar>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div class="font-medium">{{ budget.allocated | currency }}</div>
                          <div class="text-gray-500">مُخصص</div>
                        </div>
                        <div>
                          <div class="font-medium">{{ budget.spent | currency }}</div>
                          <div class="text-gray-500">مُنفق</div>
                        </div>
                        <div>
                          <div class="font-medium">{{ budget.remaining | currency }}</div>
                          <div class="text-gray-500">متبقي</div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-4 border-t">
                      <p class="text-sm font-medium mb-2">التصنيفات</p>
                      @for (cat of budget.categories; track cat.category) {
                        <div class="flex justify-between text-sm mb-1">
                          <span>{{ cat.category }}</span>
                          <span>{{ cat.spent }}/{{ cat.allocated }}</span>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        </mat-tab>

        <mat-tab label="تغييرات التكلفة">
          <div class="p-4">
            <div class="mat-elevation-z2 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="costChanges" class="w-full">
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>الوصف</th>
                  <td mat-cell *matCellDef="let cc">{{ cc.description }}</td>
                </ng-container>

                <ng-container matColumnDef="originalCost">
                  <th mat-header-cell *matHeaderCellDef>التكلفة الأصلية</th>
                  <td mat-cell *matCellDef="let cc">{{ cc.originalCost | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="newCost">
                  <th mat-header-cell *matHeaderCellDef>التكلفة الجديدة</th>
                  <td mat-cell *matCellDef="let cc">{{ cc.newCost | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="changeAmount">
                  <th mat-header-cell *matHeaderCellDef>التغيير</th>
                  <td mat-cell *matCellDef="let cc" [class.text-red-600]="cc.changeType === 'increase'" [class.text-green-600]="cc.changeType === 'decrease'">
                    {{ cc.changeType === 'increase' ? '+' : '-' }}{{ cc.changeAmount | currency }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>الحالة</th>
                  <td mat-cell *matCellDef="let cc">
                    <mat-chip [color]="cc.status === 'approved' ? 'accent' : cc.status === 'pending' ? 'warn' : ''" selected>
                      {{ cc.status === 'approved' ? 'معتمد' : cc.status === 'pending' ? 'معلق' : 'مرفوض' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
                  <td mat-cell *matCellDef="let cc">
                    <button mat-icon-button (click)="approveChange(cc)" *ngIf="cc.status === 'pending'" color="accent">
                      <mat-icon>check</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="changeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: changeColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class ProjectBudgetingComponent implements OnInit {
  budgets: ProjectBudget[] = [];
  costChanges: CostChange[] = [];
  totalBudget = 0;
  totalSpent = 0;
  remainingBudget = 0;
  budgetUsage = 0;
  changeColumns = ['description', 'originalCost', 'newCost', 'changeAmount', 'status', 'actions'];

  constructor(private projectBudgetService: ProjectBudgetService) {}

  ngOnInit() {
    this.loadBudgets();
  }

  loadBudgets() {
    this.projectBudgetService.getBudgets().subscribe(response => {
      this.budgets = response.data;
      this.totalBudget = response.totalBudget || 0;
      this.totalSpent = response.totalSpent || 0;
      this.remainingBudget = this.totalBudget - this.totalSpent;
      this.budgetUsage = this.totalBudget > 0 ? Math.round((this.totalSpent / this.totalBudget) * 100) : 0;
    });

    this.projectBudgetService.getCostChanges('').subscribe(changes => {
      this.costChanges = changes;
    });
  }

  getStatusColor(status: BudgetStatus): string {
    switch (status) {
      case 'on_track': return 'accent';
      case 'over_budget': return 'warn';
      case 'under_budget': return 'primary';
      case 'critical': return '';
      default: return '';
    }
  }

  getStatusLabel(status: BudgetStatus): string {
    const labels: Record<BudgetStatus, string> = {
      on_track: 'على المسار',
      over_budget: 'تجاوز الميزانية',
      under_budget: 'أقل من الميزانية',
      critical: 'حرج'
    };
    return labels[status] || status;
  }

  getUsagePercent(budget: ProjectBudget): number {
    return budget.totalBudget > 0 ? Math.round((budget.spent / budget.totalBudget) * 100) : 0;
  }

  approveChange(change: CostChange) {
    this.projectBudgetService.approveCostChange(change.id).subscribe(() => {
      this.loadBudgets();
    });
  }
}