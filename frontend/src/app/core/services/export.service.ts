import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ExportOptions {
  type: 'EXCEL' | 'PDF' | 'CSV';
  module: string;
  filters?: any;
  columns?: string[];
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly API_URL = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  exportData(options: ExportOptions): Observable<Blob> {
    return this.http.post(`${this.API_URL}`, options, {
      responseType: 'blob',
    });
  }

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  printTable(elementId: string, title: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1e293b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: right; }
        th { background: #f8fafc; font-weight: 600; }
        .print-footer { margin-top: 20px; text-align: center; color: #64748b; font-size: 12px; }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <h1>${title}</h1>
          ${element.outerHTML}
          <div class="print-footer">
            نظام ERB للتشطيبات والعقارات - ${new Date().toLocaleDateString('ar-SA')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}