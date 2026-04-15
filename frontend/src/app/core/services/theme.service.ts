import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSignal = signal(false);
  isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.darkModeSignal.set(true);
      this.applyDarkMode(true);
    }
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSignal();
    this.darkModeSignal.set(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    this.applyDarkMode(newValue);
  }

  setDarkMode(value: boolean): void {
    this.darkModeSignal.set(value);
    localStorage.setItem('darkMode', value.toString());
    this.applyDarkMode(value);
  }

  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}