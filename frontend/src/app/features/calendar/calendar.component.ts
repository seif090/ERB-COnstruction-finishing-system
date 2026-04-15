import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '@core/services/calendar.service';
import { CalendarEvent, CalendarEventType } from '@core/models/calendar.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">التقويم</h1>
        <button mat-raised-button color="primary" (click)="openEventDialog()">
          <mat-icon>add</mat-icon>
          إضافة حدث
        </button>
      </div>

      <div class="flex gap-4 mb-6">
        <mat-form-field appearance="outline" class="w-40">
          <mat-label>الشهر</mat-label>
          <mat-select [(ngModel)]="currentMonth" (selectionChange)="loadEvents()">
            <mat-option [value]="1">يناير</mat-option>
            <mat-option [value]="2">فبراير</mat-option>
            <mat-option [value]="3">مارس</mat-option>
            <mat-option [value]="4">أبريل</mat-option>
            <mat-option [value]="5">مايو</mat-option>
            <mat-option [value]="6">يونيو</mat-option>
            <mat-option [value]="7">يوليو</mat-option>
            <mat-option [value]="8">أغسطس</mat-option>
            <mat-option [value]="9">سبتمبر</mat-option>
            <mat-option [value]="10">أكتوبر</mat-option>
            <mat-option [value]="11">نوفمبر</mat-option>
            <mat-option [value]="12">ديسمبر</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-32">
          <mat-label>السنة</mat-label>
          <mat-select [(ngModel)]="currentYear" (selectionChange)="loadEvents()">
            <mat-option [value]="2024">2024</mat-option>
            <mat-option [value]="2025">2025</mat-option>
            <mat-option [value]="2026">2026</mat-option>
            <mat-option [value]="2027">2027</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="flex-1"></div>

        <button mat-icon-button (click)="previousMonth()">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button mat-button (click)="goToToday()">اليوم</button>
        <button mat-icon-button (click)="nextMonth()">
          <mat-icon>chevron_left</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-2">
        <div class="text-center font-medium p-2">الأحد</div>
        <div class="text-center font-medium p-2">الاثنين</div>
        <div class="text-center font-medium p-2">الثلاثاء</div>
        <div class="text-center font-medium p-2">الأربعاء</div>
        <div class="text-center font-medium p-2">الخميس</div>
        <div class="text-center font-medium p-2">الجمعة</div>
        <div class="text-center font-medium p-2">السبت</div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        @for (day of calendarDays; track $index) {
          <mat-card 
            class="min-h-24 cursor-pointer hover:shadow-md transition-shadow"
            [class.bg-blue-50]="isToday(day)"
            [class.border-2]="isToday(day)"
            [class.border-blue-500]="isToday(day)"
            (click)="selectDay(day)"
          >
            <mat-card-content class="p-2">
              <div class="text-sm font-medium" [class.text-blue-600]="isToday(day)">
                {{ day }}
              </div>
              @for (event of getEventsForDay(day); track event.id) {
                <div 
                  class="text-xs truncate mt-1 px-1 py-0.5 rounded"
                  [style.background-color]="getEventColor(event.eventType)"
                >
                  {{ event.title }}
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-medium mb-3">الأحداث القادمة</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (event of upcomingEvents; track event.id) {
            <mat-card class="mat-elevation-z2">
              <mat-card-content>
                <div class="flex items-start gap-3">
                  <mat-icon [style.color]="getEventColor(event.eventType)">event</mat-icon>
                  <div class="flex-1">
                    <h4 class="font-medium">{{ event.title }}</h4>
                    <p class="text-sm text-gray-500">{{ event.startDate | date:'short' }}</p>
                    <mat-chip class="mt-1" [style.background-color]="getEventColor(event.eventType)">
                      {{ getEventTypeLabel(event.eventType) }}
                    </mat-chip>
                  </div>
                  <button mat-icon-button color="warn" (click)="deleteEvent(event)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-h-24 { min-height: 80px; }
  `]
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  calendarDays: number[] = [];
  upcomingEvents: CalendarEvent[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  selectedDate: Date = new Date();

  constructor(private calendarService: CalendarService, private dialog: MatDialog) {}

  ngOnInit() {
    this.generateCalendarDays();
    this.loadEvents();
  }

  generateCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    this.calendarDays = [];
    for (let i = 0; i < startPadding; i++) {
      this.calendarDays.push(0);
    }
    for (let i = 1; i <= totalDays; i++) {
      this.calendarDays.push(i);
    }
  }

  loadEvents() {
    const startDate = new Date(this.currentYear, this.currentMonth - 1, 1).toISOString();
    const endDate = new Date(this.currentYear, this.currentMonth, 0).toISOString();
    
    this.calendarService.getEvents({ startDate, endDate }).subscribe(response => {
      this.events = response.data;
      this.upcomingEvents = this.events
        .filter(e => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 6);
    });
  }

  getEventsForDay(day: number): CalendarEvent[] {
    if (day === 0) return [];
    const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.events.filter(e => e.startDate.startsWith(dateStr));
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() + 1 && 
           this.currentYear === today.getFullYear();
  }

  selectDay(day: number) {
    if (day > 0) {
      this.selectedDate = new Date(this.currentYear, this.currentMonth - 1, day);
    }
  }

  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendarDays();
    this.loadEvents();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendarDays();
    this.loadEvents();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth() + 1;
    this.currentYear = today.getFullYear();
    this.generateCalendarDays();
    this.loadEvents();
  }

  openEventDialog() {
  }

  deleteEvent(event: CalendarEvent) {
    if (confirm('حذف هذا الحدث؟')) {
      this.calendarService.deleteEvent(event.id).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  getEventColor(type: CalendarEventType): string {
    const colors: Record<CalendarEventType, string> = {
      meeting: '#3B82F6',
      task_deadline: '#EF4444',
      project_milestone: '#8B5CF6',
      payment_due: '#10B981',
      inspection: '#F59E0B',
      leave: '#6B7280',
      other: '#EC4899'
    };
    return colors[type] || '#6B7280';
  }

  getEventTypeLabel(type: CalendarEventType): string {
    const labels: Record<CalendarEventType, string> = {
      meeting: 'اجتماع',
      task_deadline: 'موعد نهائي للمهمة',
      project_milestone: 'معلم مشروع',
      payment_due: 'موعد دفع',
      inspection: 'تفتيش',
      leave: 'إجازة',
      other: 'أخرى'
    };
    return labels[type] || type;
  }
}