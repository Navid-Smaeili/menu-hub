import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'fa' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<AppLanguage>('fa');

  get direction(): 'rtl' | 'ltr' {
    return this.language() === 'fa' ? 'rtl' : 'ltr';
  }

  toggle(): void {
    this.language.update(language => (language === 'fa' ? 'en' : 'fa'));
  }
}