import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, CreateIssueRequest, UpdateIssueRequest, IssueQueryParams, PaginatedIssues, IssueComment } from '@core/models/issue.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = `${environment.apiUrl}/issues`;

  constructor(private http: HttpClient) {}

  getIssues(params?: IssueQueryParams): Observable<PaginatedIssues> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
      if (params.assignedTo) httpParams = httpParams.set('assignedTo', params.assignedTo);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.priority) httpParams = httpParams.set('priority', params.priority);
      if (params.category) httpParams = httpParams.set('category', params.category);
    }
    return this.http.get<PaginatedIssues>(this.apiUrl, { params: httpParams });
  }

  getIssue(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  createIssue(issue: CreateIssueRequest): Observable<Issue> {
    return this.http.post<Issue>(this.apiUrl, issue);
  }

  updateIssue(id: string, issue: UpdateIssueRequest): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}`, issue);
  }

  deleteIssue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addComment(issueId: string, content: string): Observable<IssueComment> {
    return this.http.post<IssueComment>(`${this.apiUrl}/${issueId}/comments`, { content });
  }

  resolveIssue(id: string): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}/resolve`, {});
  }

  reopenIssue(id: string): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}/reopen`, {});
  }
}