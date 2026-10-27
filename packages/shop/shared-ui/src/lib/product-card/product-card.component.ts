import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '@org/models';
import { LanguageService } from '@org/shared';

@Component({
  selector: 'shop-product-card',
  imports: [],
  template: `
    <div
      class="product-card"
      (click)="productClick.emit(product())"
      (keyup.enter)="productClick.emit(product())"
      (keyup.space)="productClick.emit(product())"
      [class.out-of-stock]="!product().inStock"
      tabindex="0"
      role="button"
      [attr.aria-label]="(locale.language() === 'fa' ? 'مشاهده جزئیات ' : 'View details for ') + product().name"
    >
      <div class="product-image" [class.image-unavailable]="imageUnavailable">
        <img [src]="product().imageUrl" [alt]="product().name" (error)="handleImageError($event)" />
        <span class="product-image-mark" aria-hidden="true">ن</span>
        @if (!product().inStock) {
          <span class="stock-badge unavailable">{{ locale.language() === 'fa' ? 'ناموجود' : 'Out of stock' }}</span>
        } @else {
          <span class="stock-badge available">{{ locale.language() === 'fa' ? 'موجود' : 'Available' }}</span>
        }
      </div>
      <div class="product-info">
        <span class="product-category">{{ product().category }}</span>
        <h3 class="product-name">{{ product().name }}</h3>
        @if (product().rating > 0) {
          <div class="product-rating" [attr.aria-label]="(locale.language() === 'fa' ? 'امتیاز ' : 'Rating ') + product().rating">
            <span class="stars" aria-hidden="true">★</span>
            <span class="rating-value">{{ product().rating.toFixed(1) }}</span>
            <span class="review-count">({{ formatNumber(product().reviewCount) }})</span>
          </div>
        }
        <div class="product-price"><strong>{{ formatPrice(product().price) }}</strong><small>{{ locale.language() === 'fa' ? 'تومان' : 'Toman' }}</small><span aria-hidden="true">{{ locale.language() === 'fa' ? '←' : '→' }}</span></div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      width: 100%;
      min-width: 0;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 2px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
      background: var(--paper);
      color: var(--ink);
      display: flex;
      flex-direction: column;
      text-align: start;
    }

    .product-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--leaf) 65%, var(--line));
      box-shadow: 0 10px 24px rgba(30, 38, 29, .08);
    }

    .product-image {
      position: relative;
      width: 100%;
      aspect-ratio: 1.5;
      overflow: hidden;
      background: #e8e4d9;
    }

    .product-image img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 280ms ease;
    }

    .product-card:hover .product-image img { transform: scale(1.035); }
    .product-image.image-unavailable {
      display: grid;
      place-items: center;
      background: radial-gradient(ellipse at 50% 54%, #f5eedf 0 25%, transparent 25.5%), repeating-linear-gradient(135deg, rgba(91, 112, 78, .08) 0 1px, transparent 1px 12px), #e4e8d9;
    }
    .product-image.image-unavailable img { display: none; }
    .product-image-mark {
      position: relative;
      z-index: 1;
      display: grid;
      width: 31%;
      aspect-ratio: 1;
      place-items: center;
      border-radius: 50%;
      background: #b64b32;
      color: #fff4e5;
      font-size: clamp(20px, 3vw, 34px);
      font-weight: 700;
    }
    .stock-badge {
      position: absolute;
      z-index: 2;
      top: 10px;
      inset-inline-start: 10px;
      padding: 4px 8px;
      font-size: 9px;
    }
    .stock-badge.available { background: #f5f8f0; color: #55744d; }
    .stock-badge.unavailable { background: #fbf0e9; color: #a64e37; }

    .product-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 13px 14px 12px;
    }
    .product-category {
      overflow: hidden;
      color: var(--leaf);
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .product-name {
      display: -webkit-box;
      overflow: hidden;
      min-height: 42px;
      margin: 3px 0 8px;
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.6;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .product-rating { display: flex; align-items: center; gap: 5px; margin: 0 0 8px; }
    .stars { color: #b78a3e; font-size: 12px; }
    .rating-value { color: var(--ink); font-size: 10px; font-weight: 600; }
    .review-count { color: var(--muted); font-size: 9px; }
    .product-price {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid var(--line);
      color: var(--ink);
    }
    .product-price strong { font-size: 12px; }
    .product-price small { color: var(--muted); font-size: 9px; }
    .product-price > span { margin-inline-start: auto; color: var(--rust); font-size: 15px; }
    .product-card:focus-visible { outline: 2px solid var(--rust); outline-offset: 3px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly locale = inject(LanguageService);
  readonly product = input.required<Product>();
  readonly productClick = output<Product>();
  imageUnavailable = false;

  handleImageError(event: Event): void {
    this.imageUnavailable = true;
    (event.target as HTMLImageElement | null)?.setAttribute('aria-hidden', 'true');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.locale.language() === 'fa' ? 'fa-IR' : 'en-US').format(price);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale.language() === 'fa' ? 'fa-IR' : 'en-US').format(value);
  }
}