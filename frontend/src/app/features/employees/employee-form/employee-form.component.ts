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
import { EmployeeService } from '@core/services/employee.service';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@core/models/employee.model';

@Component({
  selector: 'app-employee-form',
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
        <button mat-icon-button routerLink="/employees">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold ml-2">{{ isEditMode ? 'Edit Employee' : 'Add Employee'  }}</h1>
      </div>

      <form [formGroup]="form" class="mat-elevation-z2 p-6 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'First Name'  }}</mat-label>
            <input matInput formControlName="firstName">
            <mat-error *ngIf="form.get('firstName')?.hasError('required')">{{ 'First name is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Last Name'  }}</mat-label>
            <input matInput formControlName="lastName">
            <mat-error *ngIf="form.get('lastName')?.hasError('required')">{{ 'Last name is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Email'  }}</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('required')">{{ 'Email is required'  }}</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">{{ 'Invalid email format'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Phone'  }}</mat-label>
            <input matInput formControlName="phone">
            <mat-error *ngIf="form.get('phone')?.hasError('required')">{{ 'Phone is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'National ID'  }}</mat-label>
            <input matInput formControlName="nationalId">
            <mat-error *ngIf="form.get('nationalId')?.hasError('required')">{{ 'National ID is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Position'  }}</mat-label>
            <input matInput formControlName="position">
            <mat-error *ngIf="form.get('position')?.hasError('required')">{{ 'Position is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Department'  }}</mat-label>
            <mat-select formControlName="department">
              <mat-option value="engineering">{{ 'Engineering'  }}</mat-option>
              <mat-option value="sales">{{ 'Sales'  }}</mat-option>
              <mat-option value="finance">{{ 'Finance'  }}</mat-option>
              <mat-option value="hr">{{ 'HR'  }}</mat-option>
              <mat-option value="operations">{{ 'Operations'  }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('department')?.hasError('required')">{{ 'Department is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Salary'  }}</mat-label>
            <input matInput type="number" formControlName="salary">
            <mat-error *ngIf="form.get('salary')?.hasError('required')">{{ 'Salary is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Hire Date'  }}</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="hireDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('hireDate')?.hasError('required')">{{ 'Hire date is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isEditMode">
            <mat-label>{{ 'Status'  }}</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">{{ 'Active'  }}</mat-option>
              <mat-option value="inactive">{{ 'Inactive'  }}</mat-option>
              <mat-option value="on_leave">{{ 'On Leave'  }}</mat-option>
              <mat-option value="terminated">{{ 'Terminated'  }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Address'  }}</mat-label>
            <textarea matInput formControlName="address" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Emergency Contact'  }}</mat-label>
            <input matInput formControlName="emergencyContact">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Emergency Phone'  }}</mat-label>
            <input matInput formControlName="emergencyPhone">
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
          <button mat-button routerLink="/employees">{{ 'Cancel'  }}</button>
        </div>
      </form>
    </div>
  `
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      nationalId: ['', Validators.required],
      position: ['', Validators.required],
      department: ['', Validators.required],
      salary: ['', Validators.required],
      hireDate: ['', Validators.required],
      status: ['active'],
      address: [''],
      emergencyContact: [''],
      emergencyPhone: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.isEditMode = true;
      this.employeeService.getEmployee(this.employeeId).subscribe(employee => {
        this.form.patchValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          nationalId: employee.nationalId,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
          hireDate: new Date(employee.hireDate),
          status: employee.status,
          address: employee.address,
          emergencyContact: employee.emergencyContact,
          emergencyPhone: employee.emergencyPhone,
          notes: employee.notes
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      formValue.hireDate = formValue.hireDate.toISOString();

      if (this.isEditMode && this.employeeId) {
        this.employeeService.updateEmployee(this.employeeId, formValue).subscribe(() => {
          this.router.navigate(['/employees']);
        });
      } else {
        this.employeeService.createEmployee(formValue).subscribe(() => {
          this.router.navigate(['/employees']);
        });
      }
    }
  }
}