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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '@core/services/document.service';
import { Document, DocumentCategory } from '@core/models/document.model';

@Component({
  selector: 'app-documents',
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
    MatProgressBarModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ 'Documents'  }}</h1>
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>upload</mat-icon>
          {{ 'Upload Document'  }}
        </button>
        <input #fileInput type="file" (change)="onFileSelected($event)" style="display: none" multiple>
      </div>

      <div class="mb-4 flex gap-4">
        <mat-form-field appearance="outline" class="w-64">
          <mat-label>{{ 'Search'  }}</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="{{ 'Search documents'  }}">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-40">
          <mat-label>{{ 'Category'  }}</mat-label>
          <mat-select [(ngModel)]="filterCategory" (selectionChange)="loadDocuments()">
            <mat-option value="">{{ 'All'  }}</mat-option>
            <mat-option value="contract">{{ 'Contract'  }}</mat-option>
            <mat-option value="invoice">{{ 'Invoice'  }}</mat-option>
            <mat-option value="blueprint">{{ 'Blueprint'  }}</mat-option>
            <mat-option value="report">{{ 'Report'  }}</mat-option>
            <mat-option value="certificate">{{ 'Certificate'  }}</mat-option>
            <mat-option value="license">{{ 'License'  }}</mat-option>
            <mat-option value="other">{{ 'Other'  }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="uploading" class="mb-4">
        <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <mat-card *ngFor="let doc of documents" class="mat-elevation-z2">
          <mat-card-content>
            <div class="flex items-start gap-3">
              <mat-icon class="text-4xl text-gray-400">description</mat-icon>
              <div class="flex-1">
                <h3 class="font-medium">{{ doc.name }}</h3>
                <p class="text-sm text-gray-500">{{ doc.fileName }}</p>
                <p class="text-xs text-gray-400">{{ formatFileSize(doc.fileSize) }} | {{ getCategoryLabel(doc.category) }}</p>
                <p class="text-xs text-gray-400">{{ doc.createdAt | date }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button mat-icon-button (click)="downloadDocument(doc)" color="primary">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteDocument(doc)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="documents.length === 0" class="text-center py-12 text-gray-500">
        <mat-icon class="text-6xl">folder_open</mat-icon>
        <p class="mt-4">{{ 'No documents found'  }}</p>
      </div>

      <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1" [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)"></mat-paginator>
    </div>
  `
})
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';
  filterCategory: DocumentCategory | '' = '';
  uploading = false;
  uploadProgress = 0;

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getDocuments({
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      category: this.filterCategory || undefined
    }).subscribe(response => {
      this.documents = response.data;
      this.total = response.total;
    });
  }

  search() {
    this.page = 1;
    this.loadDocuments();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadDocuments();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.uploading = true;
      this.uploadProgress = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.documentService.uploadDocument({
          name: file.name.replace(/\.[^/.]+$/, ''),
          file: file,
          category: 'other'
        }).subscribe({
          next: () => {
            this.uploadProgress = ((i + 1) / files.length) * 100;
            if (i === files.length - 1) {
              this.uploading = false;
              this.loadDocuments();
            }
          },
          error: () => {
            this.uploading = false;
          }
        });
      }
    }
  }

  downloadDocument(doc: Document) {
    this.documentService.downloadDocument(doc.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteDocument(doc: Document) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(doc.id).subscribe(() => {
        this.loadDocuments();
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getCategoryLabel(category: DocumentCategory): string {
    const labels: Record<DocumentCategory, string> = {
      contract: 'Contract',
      invoice: 'Invoice',
      blueprint: 'Blueprint',
      report: 'Report',
      certificate: 'Certificate',
      license: 'License',
      other: 'Other'
    };
    return labels[category] || category;
  }
}