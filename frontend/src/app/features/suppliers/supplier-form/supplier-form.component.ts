import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '@core/services/supplier.service';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest, SupplierCategory, SupplierStatus } from '@core/models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <button mat-icon-button routerLink="/suppliers">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold ml-2">{{ isEditMode ? 'Edit Supplier' : 'Add Supplier'  }}</h1>
      </div>

      <form [formGroup]="form" class="mat-elevation-z2 p-6 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'Company Name'  }}</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'Name is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Contact Person'  }}</mat-label>
            <input matInput formControlName="contactPerson">
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

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Address'  }}</mat-label>
            <textarea matInput formControlName="address" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Category'  }}</mat-label>
            <mat-select formControlName="category">
              <mat-option value="materials">{{ 'Materials'  }}</mat-option>
              <mat-option value="equipment">{{ 'Equipment'  }}</mat-option>
              <mat-option value="furniture">{{ 'Furniture'  }}</mat-option>
              <mat-option value="electrical">{{ 'Electrical'  }}</mat-option>
              <mat-option value="plumbing">{{ 'Plumbing'  }}</mat-option>
              <mat-option value="paint">{{ 'Paint'  }}</mat-option>
              <mat-option value="tools">{{ 'Tools'  }}</mat-option>
              <mat-option value="other">{{ 'Other'  }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('category')?.hasError('required')">{{ 'Category is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isEditMode">
            <mat-label>{{ 'Status'  }}</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">{{ 'Active'  }}</mat-option>
              <mat-option value="inactive">{{ 'Inactive'  }}</mat-option>
              <mat-option value="blocked">{{ 'Blocked'  }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Rating'  }}</mat-label>
            <input matInput type="number" formControlName="rating" min="0" max="5">
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
          <button mat-button routerLink="/suppliers">{{ 'Cancel'  }}</button>
        </div>
      </form>
    </div>
  `
})
export class SupplierFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  supplierId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      contactPerson: [''],
      category: ['materials', Validators.required],
      status: ['active'],
      rating: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.isEditMode = true;
      this.supplierService.getSupplier(this.supplierId).subscribe(supplier => {
        this.form.patchValue({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          contactPerson: supplier.contactPerson,
          category: supplier.category,
          status: supplier.status,
          rating: supplier.rating,
          notes: supplier.notes
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      if (this.isEditMode && this.supplierId) {
        this.supplierService.updateSupplier(this.supplierId, formValue).subscribe(() => {
          this.router.navigate(['/suppliers']);
        });
      } else {
        this.supplierService.createSupplier(formValue).subscribe(() => {
          this.router.navigate(['/suppliers']);
        });
      }
    }
  }
}