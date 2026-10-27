import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService, LanguageService, ThemeService } from '@org/shared';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly locale = inject(LanguageService);
  protected readonly theme = inject(ThemeService);
  protected readonly cart = inject(CartService);

  protected t(key: string): string {
    const copy: Record<string, [string, string]> = {
      brand: ['کافه نون و نمک', 'Noon & Namak Cafe'],
      tagline: ['طعم خوب، حال خوب', 'Good food, good mood'],
      home: ['خانه', 'Home'],
      categories: ['دسته‌بندی‌ها', 'Categories'],
      menu: ['منو', 'Menu'],
      account: ['ورود / ثبت‌نام', 'Sign in / Sign up'],
      footer: ['هر روز، تازه و با عشق آماده می‌شود.', 'Freshly made with love, every day.'],
      hours: ['شنبه تا پنجشنبه، ۸ تا ۲۳', 'Sat–Thu, 8 AM–11 PM'],
      mainNavigation: ['ناوبری اصلی', 'Main navigation'],
      switchToDark: ['فعال‌کردن تم تیره', 'Switch to dark theme'],
      switchToLight: ['فعال‌کردن تم روشن', 'Switch to light theme'],
      cart: ['سبد خرید', 'Cart'],
    };
    const values = copy[key] ?? [key, key];
    return values[this.locale.language() === 'fa' ? 0 : 1];
  }
}
