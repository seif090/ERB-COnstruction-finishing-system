import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface SearchResult {
  type: 'CLIENT' | 'PROJECT' | 'CONTRACTOR' | 'UNIT' | 'CONTRACT';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  link: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly API_URL = `${environment.apiUrl}/search`;
  
  private searchResultsSignal = signal<SearchResult[]>([]);
  private isSearchingSignal = signal(false);
  
  searchResults = this.searchResultsSignal.asReadonly();
  isSearching = this.isSearchingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  search(query: string, types?: string[]): Observable<SearchResult[]> {
    this.isSearchingSignal.set(true);
    
    let params = new HttpParams().set('q', query);
    if (types && types.length > 0) {
      params = params.set('types', types.join(','));
    }

    return this.http.get<SearchResult[]>(this.API_URL, { params });
  }

  quickSearch(query: string) {
    if (!query || query.length < 2) {
      this.searchResultsSignal.set([]);
      return;
    }

    this.search(query).subscribe({
      next: (results) => {
        this.searchResultsSignal.set(results);
        this.isSearchingSignal.set(false);
      },
      error: () => {
        this.isSearchingSignal.set(false);
      },
    });
  }

  clearResults() {
    this.searchResultsSignal.set([]);
  }
}