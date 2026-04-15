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
import { LeadService } from '@core/services/lead.service';
import { Lead, LeadSource, LeadStatus } from '@core/models/lead.model';

@Component({
  selector: 'app-leads',
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
        <h1 class="text-2xl font-bold">{{ 'Leads'  }}</h1>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          {{ 'Add Lead'  }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card class="cursor-pointer" (click)="filterByStatus('new')" [class.border-2]="filterStatus === 'new'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ newCount }}</div>
              <div class="text-gray-500">{{ 'New'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('contacted')" [class.border-2]="filterStatus === 'contacted'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ contactedCount }}</div>
              <div class="text-gray-500">{{ 'Contacted'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('qualified')" [class.border-2]="filterStatus === 'qualified'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ qualifiedCount }}</div>
              <div class="text-gray-500">{{ 'Qualified'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="cursor-pointer" (click)="filterByStatus('won')" [class.border-2]="filterStatus === 'won'">
          <mat-card-content>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ wonCount }}</div>
              <div class="text-gray-500">{{ 'Won'  }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-64">
          <mat-label>{{ 'Search'  }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="{{ 'Search leads'  }}">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Source'  }}</mat-label>
          <mat-select [(ngModel)]="filterSource" (selectionChange)="loadLeads()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="website">{{ 'Website'  }}</mat-option>
            <mat-option value="facebook">Facebook</mat-option>
            <mat-option value="instagram">Instagram</mat-option>
            <mat-option value="referral">{{ 'Referral'  }}</mat-option>
            <mat-option value="walk_in">{{ 'Walk In'  }}</mat-option>
            <mat-option value="cold_call">{{ 'Cold Call'  }}</mat-option>
            <mat-option value="other">{{ 'Other'  }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mat-elevation-z2 rounded-lg overflow-hidden">
        <table mat-table [dataSource]="leads" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'Name'  }}</th>
            <td mat-cell *matCellDef="let lead">{{ lead.firstName }} {{ lead.lastName }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>{{ 'Email'  }}</th>
            <td mat-cell *matCellDef="let lead">{{ lead.email }}</td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>{{ 'Phone'  }}</th>
            <td mat-cell *matCellDef="let lead">{{ lead.phone }}</td>
          </ng-container>

          <ng-container matColumnDef="source">
            <th mat-header-cell *matHeaderCellDef>{{ 'Source'  }}</th>
            <td mat-cell *matCellDef="let lead">
              <mat-chip>{{ getSourceLabel(lead.source) }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'Status'  }}</th>
            <td mat-cell *matCellDef="let lead">
              <mat-chip [color]="getStatusColor(lead.status)" selected>
                {{ getStatusLabel(lead.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="budget">
            <th mat-header-cell *matHeaderCellDef>{{ 'Budget'  }}</th>
            <td mat-cell *matCellDef="let lead">{{ lead.budget | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>{{ 'Actions'  }}</th>
            <td mat-cell *matCellDef="let lead">
              <button mat-icon-button [routerLink]="[lead.id]" color="primary">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="convertLead(lead)" *ngIf="lead.status !== 'won'" color="accent">
                <mat-icon>check_circle</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteLead(lead)" color="warn">
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
export class LeadsComponent implements OnInit {
  displayedColumns = ['name', 'email', 'phone', 'source', 'status', 'budget', 'actions'];
  leads: Lead[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';
  filterSource: LeadSource | '' = '';
  filterStatus: LeadStatus | '' = '';
  newCount = 0;
  contactedCount = 0;
  qualifiedCount = 0;
  wonCount = 0;

  constructor(private leadService: LeadService) {}

  ngOnInit() {
    this.loadLeads();
    this.loadStats();
  }

  loadLeads() {
    this.leadService.getLeads({
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      source: this.filterSource || undefined,
      status: this.filterStatus || undefined
    }).subscribe(response => {
      this.leads = response.data;
      this.total = response.total;
    });
  }

  loadStats() {
    this.leadService.getLeads({ limit: 100 }).subscribe(response => {
      this.newCount = response.data.filter(l => l.status === 'new').length;
      this.contactedCount = response.data.filter(l => l.status === 'contacted').length;
      this.qualifiedCount = response.data.filter(l => l.status === 'qualified').length;
      this.wonCount = response.data.filter(l => l.status === 'won').length;
    });
  }

  filterByStatus(status: LeadStatus | '') {
    this.filterStatus = status;
    this.page = 1;
    this.loadLeads();
  }

  search() {
    this.page = 1;
    this.loadLeads();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLeads();
  }

  getSourceLabel(source: LeadSource): string {
    const labels: Record<LeadSource, string> = {
      website: 'Website',
      facebook: 'Facebook',
      instagram: 'Instagram',
      referral: 'Referral',
      walk_in: 'Walk In',
      cold_call: 'Cold Call',
      other: 'Other'
    };
    return labels[source] || source;
  }

  getStatusColor(status: LeadStatus): string {
    switch (status) {
      case 'new': return 'primary';
      case 'contacted': return '';
      case 'qualified': return 'accent';
      case 'proposal': return 'accent';
      case 'negotiation': return 'accent';
      case 'won': return 'warn';
      case 'lost': return '';
      default: return '';
    }
  }

  getStatusLabel(status: LeadStatus): string {
    const labels: Record<LeadStatus, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost'
    };
    return labels[status] || status;
  }

  convertLead(lead: Lead) {
    if (confirm('Convert this lead to a client?')) {
      this.leadService.updateLead(lead.id, { status: 'won', convertedAt: new Date().toISOString() }).subscribe(() => {
        this.loadLeads();
        this.loadStats();
      });
    }
  }

  deleteLead(lead: Lead) {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.leadService.deleteLead(lead.id).subscribe(() => {
        this.loadLeads();
        this.loadStats();
      });
    }
  }
}