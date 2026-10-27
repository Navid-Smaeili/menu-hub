import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  readonly mode = signal<ThemeMode>(this.readSavedMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      this.document.documentElement.setAttribute('data-theme', mode);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('menu-hub-theme', mode);
      }
    });
  }

  toggle(): void {
    this.mode.update(mode => mode === 'light' ? 'dark' : 'light');
  }

  private readSavedMode(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    return localStorage.getItem('menu-hub-theme') === 'dark' ? 'dark' : 'light';
  }
}