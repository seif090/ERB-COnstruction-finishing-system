import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '@core/services/lead.service';
import { Lead, CreateLeadRequest, UpdateLeadRequest, LeadSource, LeadStatus } from '@core/models/lead.model';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center mb-6">
        <button mat-icon-button routerLink="/leads">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold ml-2">{{ isEditMode ? 'Edit Lead' : 'Add Lead'  }}</h1>
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
            <mat-label>{{ 'Company'  }}</mat-label>
            <input matInput formControlName="company">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Source'  }}</mat-label>
            <mat-select formControlName="source">
              <mat-option value="website">{{ 'Website'  }}</mat-option>
              <mat-option value="facebook">Facebook</mat-option>
              <mat-option value="instagram">Instagram</mat-option>
              <mat-option value="referral">{{ 'Referral'  }}</mat-option>
              <mat-option value="walk_in">{{ 'Walk In'  }}</mat-option>
              <mat-option value="cold_call">{{ 'Cold Call'  }}</mat-option>
              <mat-option value="other">{{ 'Other'  }}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('source')?.hasError('required')">{{ 'Source is required'  }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isEditMode">
            <mat-label>{{ 'Status'  }}</mat-label>
            <mat-select formControlName="status">
              <mat-option value="new">{{ 'New'  }}</mat-option>
              <mat-option value="contacted">{{ 'Contacted'  }}</mat-option>
              <mat-option value="qualified">{{ 'Qualified'  }}</mat-option>
              <mat-option value="proposal">{{ 'Proposal'  }}</mat-option>
              <mat-option value="negotiation">{{ 'Negotiation'  }}</mat-option>
              <mat-option value="won">{{ 'Won'  }}</mat-option>
              <mat-option value="lost">{{ 'Lost'  }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Budget'  }}</mat-label>
            <input matInput type="number" formControlName="budget">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'Assigned To'  }}</mat-label>
            <input matInput formControlName="assignedTo">
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ 'Requirements'  }}</mat-label>
            <textarea matInput formControlName="requirements" rows="3"></textarea>
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
          <button mat-button routerLink="/leads">{{ 'Cancel'  }}</button>
        </div>
      </form>
    </div>
  `
})
export class LeadFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  leadId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      source: ['website', Validators.required],
      status: ['new'],
      budget: [''],
      requirements: [''],
      assignedTo: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.leadService.getLead(this.leadId).subscribe(lead => {
        this.form.patchValue({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          source: lead.source,
          status: lead.status,
          budget: lead.budget,
          requirements: lead.requirements,
          assignedTo: lead.assignedTo,
          notes: lead.notes
        });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      if (this.isEditMode && this.leadId) {
        this.leadService.updateLead(this.leadId, formValue).subscribe(() => {
          this.router.navigate(['/leads']);
        });
      } else {
        this.leadService.createLead(formValue).subscribe(() => {
          this.router.navigate(['/leads']);
        });
      }
    }
  }
}