import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchService, SearchResult } from '../../core/services/search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="search-container" #searchContainer>
      <div class="search-input-wrapper">
        <mat-icon>search</mat-icon>
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          (focus)="showResults.set(true)"
          placeholder="بحث سريع..."
          class="search-input"
        >
        @if (searchService.isSearching()) {
          <mat-spinner diameter="20"></mat-spinner>
        }
        @if (searchQuery) {
          <button mat-icon-button (click)="clearSearch()" class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      @if (showResults() && searchService.searchResults().length > 0) {
        <div class="search-results">
          @for (result of searchService.searchResults(); track result.id) {
            <a [routerLink]="result.link" class="result-item" (click)="clearSearch()">
              <mat-icon>{{ result.icon }}</mat-icon>
              <div class="result-content">
                <span class="result-title">{{ result.title }}</span>
                <span class="result-subtitle">{{ result.subtitle }}</span>
              </div>
              <span class="result-type">{{ getTypeLabel(result.type) }}</span>
            </a>
          }
        </div>
      }

      @if (showResults() && searchQuery && searchService.searchResults().length === 0 && !searchService.isSearching()) {
        <div class="search-results empty">
          <mat-icon>search_off</mat-icon>
          <span>لا توجد نتائج</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 100%;
      max-width: 400px;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0 12px;
    }

    .search-input-wrapper mat-icon {
      color: var(--text-secondary);
      margin-right: 8px;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 0;
      font-size: 14px;
      color: var(--text-primary);
      outline: none;
    }

    .search-input::placeholder {
      color: var(--text-secondary);
    }

    .clear-btn {
      margin-left: 0;
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-top: 4px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      text-decoration: none;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-item:hover {
      background: var(--background-color);
    }

    .result-item mat-icon {
      color: var(--primary-color);
    }

    .result-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .result-title {
      font-weight: 500;
    }

    .result-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .result-type {
      font-size: 11px;
      padding: 2px 8px;
      background: var(--background-color);
      border-radius: 10px;
      color: var(--text-secondary);
    }

    .search-results.empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      color: var(--text-secondary);
    }

    .search-results.empty mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
    }
  `]
})
export class GlobalSearchComponent {
  @ViewChild('searchContainer') searchContainer!: ElementRef;
  
  searchQuery = '';
  showResults = signal(false);

  constructor(public searchService: SearchService) {}

  onSearch() {
    this.searchService.quickSearch(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchService.clearResults();
    this.showResults.set(false);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CLIENT: 'عميل',
      PROJECT: 'مشروع',
      CONTRACTOR: 'مقاول',
      UNIT: 'وحدة',
      CONTRACT: 'عقد',
    };
    return labels[type] || type;
  }
}