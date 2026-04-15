import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '@core/services/task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskPriority, TaskStatus } from '@core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <button mat-icon-button routerLink="/tasks">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold ml-2">{{ isEditMode ? 'Edit Task' : 'Add Task'  }}</h1>
      </div>

      <form [formGroup]="form" class="mat-elevation-z2 p-6 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Title'  }}</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="form.get('title')?.hasError('required')">{{ 'Title is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Description'  }}</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            <mat-error *ngIf="form.get('description')?.hasError('required')">{{ 'Description is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Project'  }}</mat-label>
            <mat-select formControlName="projectId">
              <mat-option value="">{{ 'None'  }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Assign To'  }}</mat-label>
            <input matInput formControlName="assignedTo">
            <mat-error *ngIf="form.get('assignedTo')?.hasError('required')">{{ 'Assignee is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Priority'  }}</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">{{ 'Low'  }}</mat-option>
              <mat-option value="medium">{{ 'Medium'  }}</mat-option>
              <mat-option value="high">{{ 'High'  }}</mat-option>
              <mat-option value="urgent">{{ 'Urgent'  }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('priority')?.hasError('required')">{{ 'Priority is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Due Date'  }}</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('dueDate')?.hasError('required')">{{ 'Due date is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isEditMode">
            <mat-label>{{ 'Status'  }}</mat-label>
            <mat-select formControlName="status">
              <mat-option value="pending">{{ 'Pending'  }}</mat-option>
              <mat-option value="in_progress">{{ 'In Progress'  }}</mat-option>
              <mat-option value="completed">{{ 'Completed'  }}</mat-option>
              <mat-option value="cancelled">{{ 'Cancelled'  }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Notes'  }}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="flex gap-4 mt-6">
          <button mat-raised-button color="primary" type="submit" (click)="onSubmit()" [disabled]="form.invalid">
            <mat-icon>save</mat-icon>
            {{ isEditMode ? 'Update' : 'Save'  }}
          </button>
          <button mat-button routerLink="/tasks">{{ 'Cancel'  }}</button>
        </div>
      </form>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  taskId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      projectId: [''],
      assignedTo: ['', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: ['', Validators.required],
      status: ['pending'],
      notes: ['']
    });
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode = true;
      this.taskService.getTask(this.taskId).subscribe(task => {
        this.form.patchValue({
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          assignedTo: task.assignedTo,
          priority: task.priority,
          dueDate: new Date(task.dueDate),
          status: task.status,
          notes: task.notes
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      formValue.dueDate = formValue.dueDate.toISOString();

      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, formValue).subscribe(() => {
          this.router.navigate(['/tasks']);
        });
      } else {
        this.taskService.createTask(formValue).subscribe(() => {
          this.router.navigate(['/tasks']);
        });
      }
    }
  }
}