import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectFilter,
  ProjectStage,
  Task
} from '../models/project.model';
import { PaginatedResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly API_URL = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(filter?: ProjectFilter): Observable<PaginatedResponse<Project>> {
    let params = new HttpParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Project>>(this.API_URL, { params });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`);
  }

  createProject(data: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.API_URL, data);
  }

  updateProject(id: string, data: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/${id}`, data);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getProjectStages(projectId: string): Observable<ProjectStage[]> {
    return this.http.get<ProjectStage[]>(`${this.API_URL}/${projectId}/stages`);
  }

  createProjectStage(projectId: string, data: {
    name: string;
    description?: string;
    order: number;
    budget: number;
    startDate?: string;
    endDate?: string;
  }): Observable<ProjectStage> {
    return this.http.post<ProjectStage>(`${this.API_URL}/${projectId}/stages`, data);
  }

  updateProjectStage(projectId: string, stageId: string, data: Partial<ProjectStage>): Observable<ProjectStage> {
    return this.http.put<ProjectStage>(`${this.API_URL}/${projectId}/stages/${stageId}`, data);
  }

  deleteProjectStage(projectId: string, stageId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}/stages/${stageId}`);
  }

  getProjectTasks(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/${projectId}/tasks`);
  }

  createProjectTask(projectId: string, data: {
    title: string;
    description?: string;
    stageId?: string;
    assigneeId?: string;
    priority: string;
    dueDate?: string;
  }): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/${projectId}/tasks`, data);
  }

  updateProjectTask(projectId: string, taskId: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${projectId}/tasks/${taskId}`, data);
  }

  deleteProjectTask(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${projectId}/tasks/${taskId}`);
  }
}