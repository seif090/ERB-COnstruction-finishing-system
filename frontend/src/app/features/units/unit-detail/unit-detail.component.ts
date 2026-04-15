import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { UnitService } from '@core/services/unit.service';
import { Unit } from '@core/models/unit.model';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-button routerLink="/units"><mat-icon>arrow_back</mat-icon> العودة للعقارات</button>
      </div>

      @if (loading()) {
        <div class="loading">جاري التحميل...</div>
      } @else if (unit()) {
        <div class="unit-detail">
          <div class="unit-gallery">
            @if (unit()!.images && unit()!.images.length > 0) {
              <div class="main-image"><img [src]="unit()!.images[0]" [alt]="unit()!.title"></div>
              @if (unit()!.images.length > 1) {
                <div class="thumbnails">
                  @for (img of unit()!.images; track img) {
                    <img [src]="img" [alt]="unit()!.title">
                  }
                </div>
              }
            } @else {
              <div class="no-image"><mat-icon>home</mat-icon></div>
            }
          </div>

          <mat-card class="info-card">
            <div class="unit-header">
              <h1>{{ unit()!.title }}</h1>
              <span class="status-badge" [class]="getStatusClass(unit()!.status)">{{ getStatusLabel(unit()!.status) }}</span>
            </div>
            
            <p class="description">{{ unit()!.description || 'لا يوجد وصف' }}</p>
            
            <div class="price-section">
              <div class="price"><span>السعر:</span> {{ formatCurrency(unit()!.price) }}</div>
              @if (unit()!.rentPrice) {
                <div class="rent"><span>الإيجار:</span> {{ formatCurrency(unit()!.rentPrice) }} / شهر</div>
              }
            </div>

            <div class="details-grid">
              <div class="detail"><mat-icon>square_foot</mat-icon><div><span>المساحة</span><strong>{{ unit()!.area }} م²</strong></div></div>
              @if (unit()!.bedrooms) { <div class="detail"><mat-icon>bed</mat-icon><div><span>الغرف</span><strong>{{ unit()!.bedrooms }}</strong></div></div> }
              @if (unit()!.bathrooms) { <div class="detail"><mat-icon>bathtub</mat-icon><div><span>الحمامات</span><strong>{{ unit()!.bathrooms }}</strong></div></div> }
              @if (unit()!.floor) { <div class="detail"><mat-icon>layers</mat-icon><div><span>الFloor</span><strong>{{ unit()!.floor }}</strong></div></div> }
              @if (unit()!.yearBuilt) { <div class="detail"><mat-icon>calendar_today</mat-icon><div><span>سنة البناء</span><strong>{{ unit()!.yearBuilt }}</strong></div></div> }
            </div>

            <div class="location-section">
              <h3>الموقع</h3>
              <p><mat-icon>location_on</mat-icon>{{ unit()!.city }} - {{ unit()!.location || 'لم يحدد' }}</p>
              @if (unit()!.buildingName) { <p><mat-icon>business</mat-icon>{{ unit()!.buildingName }}</p> }
            </div>

            @if (unit()!.amenities && unit()!.amenities.length > 0) {
              <div class="amenities-section">
                <h3>المرافق</h3>
                <mat-chip-set>
                  @for (amenity of unit()!.amenities; track amenity) {
                    <mat-chip>{{ amenity }}</mat-chip>
                  }
                </mat-chip-set>
              </div>
            }
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .unit-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .unit-gallery { display: flex; flex-direction: column; gap: 12px; }
    .main-image { border-radius: 16px; overflow: hidden; height: 400px; background: #e2e8f0; }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .thumbnails { display: flex; gap: 8px; overflow-x: auto; }
    .thumbnails img { width: 80px; height: 60px; border-radius: 8px; object-fit: cover; cursor: pointer; }
    .no-image { height: 400px; border-radius: 16px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; }
    .no-image mat-icon { font-size: 80px; width: 80px; height: 80px; color: #94a3b8; }
    .info-card { padding: 24px; border-radius: 16px; }
    .unit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .unit-header h1 { margin: 0; }
    .status-badge { padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .status-badge.available { background: #dcfce7; color: #16a34a; }
    .status-badge.reserved { background: #fef3c7; color: #d97706; }
    .status-badge.sold { background: #dbeafe; color: #2563eb; }
    .status-badge.rented { background: #f3e8ff; color: #9333ea; }
    .description { color: var(--text-secondary); margin-bottom: 20px; }
    .price-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; padding: 16px; background: var(--background-color); border-radius: 12px; }
    .price-section .price { font-size: 24px; font-weight: 700; color: var(--primary-color); }
    .price-section .price span { font-size: 14px; color: var(--text-secondary); font-weight: 400; }
    .price-section .rent { color: var(--text-secondary); }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .detail { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--background-color); border-radius: 12px; }
    .detail mat-icon { color: var(--primary-color); }
    .detail span { display: block; font-size: 12px; color: var(--text-secondary); }
    .detail strong { font-size: 18px; }
    .location-section, .amenities-section { margin-bottom: 24px; }
    .location-section h3, .amenities-section h3 { margin: 0 0 12px; }
    .location-section p { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); margin-bottom: 8px; }
    .location-section mat-icon { color: var(--primary-color); }
    .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
    @media (max-width: 768px) { .unit-detail { grid-template-columns: 1fr; } }
  `]
})
export class UnitDetailComponent implements OnInit {
  @Input() id!: string;
  loading = signal(true);
  unit = signal<Unit | null>(null);

  constructor(private unitService: UnitService) {}

  ngOnInit() { this.loadUnit(); }

  loadUnit() {
    this.unitService.getUnit(this.id).subscribe({
      next: (data) => { this.unit.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getStatusClass(status: string): string { return status.toLowerCase(); }
  getStatusLabel(status: string): string { const labels: Record<string, string> = { AVAILABLE: 'متاحة', RESERVED: 'محجوزة', SOLD: 'مباعة', RENTED: 'مؤجرة', UNDER_MAINTENANCE: 'صيانة' }; return labels[status] || status; }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount); }
}