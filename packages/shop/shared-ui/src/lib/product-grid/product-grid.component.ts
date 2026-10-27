import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@org/models';
import { LanguageService } from '@org/shared';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'shop-product-grid',
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-grid">
      @for (product of products(); track product.id) {
        <shop-product-card
          [product]="product"
          (productClick)="productSelect.emit($event)"
        />
      }
      @empty {
        <div class="no-products">
          <span aria-hidden="true">⌕</span>
          <h2>{{ locale.language() === 'fa' ? 'موردی پیدا نشد' : 'Nothing found' }}</h2>
          <p>{{ locale.language() === 'fa' ? 'فیلترها را تغییر بده یا عبارت دیگری جست‌وجو کن.' : 'Try changing your filters or searching for something else.' }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 17px;
      padding: 10px 0 0;
    }

    .no-products {
      grid-column: 1 / -1;
      display: grid;
      justify-items: center;
      align-content: center;
      min-height: 250px;
      padding: 30px;
      border: 1px dashed var(--line);
      color: var(--muted);
      text-align: center;
    }
    .no-products > span { display: grid; width: 42px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--leaf) 14%, var(--paper)); color: var(--leaf); font-size: 24px; }
    .no-products h2 { margin: 10px 0 3px; color: var(--ink); font-size: 15px; }
    .no-products p { margin: 0; font-size: 11px; }

    @media (max-width: 1000px) {
      .product-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (max-width: 680px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGridComponent {
  readonly locale = inject(LanguageService);
  readonly products = input.required<Product[]>();
  readonly productSelect = output<Product>();
}