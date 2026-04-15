import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '@core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ 'Tasks'  }}</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          {{ 'Add Task'  }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="cursor-pointer" (click)="filterByStatus('pending')" [class.border-2]="filterStatus === 'pending'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ pendingCount }}</div>
              <div class="text-gray-500">{{ 'Pending'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('in_progress')" [class.border-2]="filterStatus === 'in_progress'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ inProgressCount }}</div>
              <div class="text-gray-500">{{ 'In Progress'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('completed')" [class.border-2]="filterStatus === 'completed'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ completedCount }}</div>
              <div class="text-gray-500">{{ 'Completed'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('')" [class.border-2]="filterStatus === ''">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ totalCount }}</div>
              <div class="text-gray-500">{{ 'Total'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-64">
          <mat-label>{{ 'Search'  }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="{{ 'Search tasks'  }}">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Priority'  }}</mat-label>
          <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadTasks()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="low">{{ 'Low'  }}</mat-option>
            <mat-option value="medium">{{ 'Medium'  }}</mat-option>
            <mat-option value="high">{{ 'High'  }}</mat-option>
            <mat-option value="urgent">{{ 'Urgent'  }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="tasks" class="w-full">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>{{ 'Title'  }}</th>
            <td mat-cell *matCellDef="let task">{{ task.title }}</td>
          </ng-container>

          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>{{ 'Assigned To'  }}</th>
            <td mat-cell *matCellDef="let task">{{ task.assignedTo }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>{{ 'Priority'  }}</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip [color]="getPriorityColor(task.priority)" selected>
                {{ getPriorityLabel(task.priority) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'Status'  }}</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip [color]="getStatusColor(task.status)" selected>
                {{ getStatusLabel(task.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="dueDate">
            <th mat-header-cell *matHeaderCellDef>{{ 'Due Date'  }}</th>
            <td mat-cell *matCellDef="let task">{{ task.dueDate | date }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>{{ 'Actions'  }}</th>
            <td mat-cell *matCellDef="let task">
              <button mat-icon-button [routerLink]="[task.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="completeTask(task)" *ngIf="task.status !== 'completed'" color="accent">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteTask(task)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1" [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)"></mat-paginator>
      </div>
    </div>
  `
})
export class TasksComponent implements OnInit {
  displayedColumns = ['title', 'assignedTo', 'priority', 'status', 'dueDate', 'actions'];
  tasks: Task[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';
  filterStatus: TaskStatus | '' = '';
  filterPriority: TaskPriority | '' = '';
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalCount = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks({
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      status: this.filterStatus || undefined,
      priority: this.filterPriority || undefined
    }).subscribe(response => {
      this.tasks = response.data;
      this.total = response.total;
    });

    this.taskService.getTasks({ limit: 100 }).subscribe(response => {
      this.totalCount = response.total;
      this.pendingCount = response.data.filter(t => t.status === 'pending').length;
      this.inProgressCount = response.data.filter(t => t.status === 'in_progress').length;
      this.completedCount = response.data.filter(t => t.status === 'completed').length;
    });
  }

  filterByStatus(status: TaskStatus | '') {
    this.filterStatus = status;
    this.page = 1;
    this.loadTasks();
  }

  search() {
    this.page = 1;
    this.loadTasks();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case 'low': return '';
      case 'medium': return 'primary';
      case 'high': return 'accent';
      case 'urgent': return 'warn';
      default: return '';
    }
  }

  getPriorityLabel(priority: TaskPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1).replace('_', ' ');
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'in_progress': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return '';
      default: return '';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  completeTask(task: Task) {
    this.taskService.updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() }).subscribe(() => {
      this.loadTasks();
    });
  }

  deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe(() => {
        this.loadTasks();
      });
    }
  }
}