export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  eventType: CalendarEventType;
  projectId?: string;
  taskId?: string;
  employeeId?: string;
  location?: string;
  reminders?: number[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 'meeting' | 'task_deadline' | 'project_milestone' | 'payment_due' | 'inspection' | 'leave' | 'other';

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  eventType: CalendarEventType;
  projectId?: string;
  taskId?: string;
  employeeId?: string;
  location?: string;
  reminders?: number[];
  color?: string;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  eventType?: CalendarEventType;
  projectId?: string;
  taskId?: string;
  employeeId?: string;
  location?: string;
  reminders?: number[];
  color?: string;
}

export interface CalendarEventQueryParams {
  startDate?: string;
  endDate?: string;
  eventType?: CalendarEventType;
  projectId?: string;
  employeeId?: string;
}

export interface PaginatedCalendarEvents {
  data: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}