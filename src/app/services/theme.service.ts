import { Injectable, Signal, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<Theme>(this.getInitialTheme());
  theme: Signal<Theme> = this._theme.asReadonly();

  constructor() {
    this.initTheme();
    this.listenToSystemThemeChanges();
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    return savedTheme || 'system';
  }

  private initTheme() {
    this.applyTheme(this._theme());
  }

  private listenToSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this._theme() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  applyTheme(theme: Theme) {
    // Determine if dark mode should be active
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Set data-theme attribute
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    );

    // Save theme preference
    localStorage.setItem('app-theme', theme);
    this._theme.set(theme);
  }

  cycleTheme() {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this._theme());
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.applyTheme(nextTheme);
  }
}
