import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '@org/shop/data';
import { Product, ProductFilter } from '@org/models';
import { LanguageService } from '@org/shared';
import {
  ProductGridComponent,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
} from '@org/shop/shared-ui';

@Component({
  selector: 'shop-product-list',
  imports: [
    CommonModule,
    FormsModule,
    ProductGridComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="product-list-container">
      <header class="catalog-heading">
        <div>
          <span class="eyebrow">{{ t('catalogEyebrow') }}</span>
          <h1>{{ t('productsTitle') }}</h1>
          <p>{{ t('productsDescription') }}</p>
        </div>
        <div class="catalog-stamp"><span aria-hidden="true">✦</span><small>{{ t('freshDaily') }}</small></div>
      </header>

      <section class="catalog-toolbar" aria-label="{{ t('catalogFilters') }}">
        <div class="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="text"
            [placeholder]="t('searchProducts')"
            [attr.aria-label]="t('searchProducts')"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            class="search-input"
          />
          @if (searchTerm) {
            <button type="button" class="clear-search" [attr.aria-label]="t('clearSearch')" (click)="searchTerm = ''; onSearchChange()">×</button>
          }
        </div>

        <label class="stock-filter" [class.checked]="inStockOnly">
          <input type="checkbox" [(ngModel)]="inStockOnly" (ngModelChange)="onFilterChange()" />
          <span class="checkmark" aria-hidden="true">✓</span>
          {{ t('inStockOnly') }}
        </label>
      </section>

      <nav class="category-filters" [attr.aria-label]="t('catalogCategories')">
        <button type="button" [class.selected]="selectedCategory === ''" (click)="selectCategory('')">{{ t('allCategories') }}</button>
        @for (category of categories(); track category) {
          <button type="button" [class.selected]="selectedCategory === category" (click)="selectCategory(category)">{{ category }}</button>
        }
      </nav>

      @if (loading()) {
        <shop-loading-spinner />
      } @else if (error()) {
        <shop-error-message
          [message]="t('loadError')"
          (retry)="loadProducts()"
        />
      } @else {
        <div class="results-bar">
          <div class="results-info"><span class="result-number">{{ formatNumber(totalProducts()) }}</span> {{ t('products') }}<span class="result-divider">·</span>{{ t('showing') }} {{ formatNumber(products().length) }}</div>
          @if (selectedCategory || inStockOnly || searchTerm) {
            <button class="clear-filters" type="button" (click)="clearFilters()">{{ t('clearFilters') }} <span aria-hidden="true">×</span></button>
          }
        </div>

        <shop-product-grid
          [products]="products()"
          (productSelect)="onProductSelect($event)"
        />

        @if (hasMorePages()) {
          <div class="pagination">
            <button
                class="page-button"
                [disabled]="currentPage() === 1"
                [attr.aria-label]="t('previous')"
                (click)="previousPage()"
            >
                <span aria-hidden="true">{{ locale.language() === 'fa' ? '→' : '←' }}</span>
            </button>
            <span class="page-info">
                {{ t('page') }} {{ formatNumber(currentPage()) }} {{ t('of') }} {{ formatNumber(totalPages()) }}
            </span>
            <button
                class="page-button"
                [disabled]="currentPage() === totalPages()"
                [attr.aria-label]="t('next')"
                (click)="nextPage()"
            >
                <span aria-hidden="true">{{ locale.language() === 'fa' ? '←' : '→' }}</span>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .product-list-container {
      width: min(1180px, calc(100% - 48px));
      margin: 0 auto;
      padding: 44px 0 76px;
    }

    .catalog-heading {
      display: flex;
      min-height: 145px;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .eyebrow { color: var(--rust); font-size: 11px; font-weight: 700; }
    .catalog-heading h1 { margin: 4px 0 2px; color: var(--ink); font-size: 30px; line-height: 1.5; }
    .catalog-heading p { margin: 0; color: var(--muted); font-size: 12px; }
    .catalog-stamp {
      display: flex;
      width: 120px;
      height: 74px;
      flex: 0 0 auto;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--paper) 60%, transparent);
      color: var(--leaf);
    }
    .catalog-stamp > span { font-size: 21px; line-height: 1; }
    .catalog-stamp small { color: var(--muted); font-size: 9px;
    }

    .catalog-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--paper) 92%, transparent);
    }

    .search-box {
      display: flex;
      width: min(450px, 70%);
      height: 42px;
      align-items: center;
      gap: 9px;
      padding: 0 10px;
      border: 1px solid var(--line);
      background: var(--paper);
      color: var(--rust);
    }

    .search-input {
      width: 100%;
      height: 100%;
      min-width: 0;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-size: 12px;
    }

    .search-input::placeholder { color: var(--muted); }
    .clear-search {
      display: grid;
      width: 26px;
      height: 26px;
      flex: 0 0 auto;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 18px;
    }

    .stock-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      color: var(--muted);
      font-size: 11px;
      cursor: pointer;
    }
    .stock-filter input { position: absolute; width: 1px; height: 1px; opacity: 0; }
    .checkmark {
      display: grid;
      width: 17px;
      height: 17px;
      place-items: center;
      border: 1px solid var(--line);
      color: transparent;
      font-size: 10px;
    }
    .stock-filter.checked { color: var(--ink); }
    .stock-filter.checked .checkmark { border-color: var(--leaf); background: var(--leaf); color: #fff; }
    .category-filters {
      display: flex;
      gap: 8px;
      margin: 16px 0 20px;
      overflow-x: auto;
      padding-bottom: 3px;
      scrollbar-width: thin;
    }
    .category-filters button {
      min-height: 34px;
      flex: 0 0 auto;
      padding: 0 14px;
      border: 1px solid var(--line);
      border-radius: 2px;
      background: transparent;
      color: var(--muted);
      font: inherit;
      font-size: 10px;
      transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
    }
    .category-filters button:hover { border-color: var(--leaf); color: var(--ink); }
    .category-filters button.selected { border-color: var(--leaf); background: var(--leaf); color: #fff; }
    .results-bar { display: flex; min-height: 32px; align-items: center; justify-content: space-between; gap: 12px; }
    .results-info { color: var(--muted); font-size: 10px; }
    .result-number { color: var(--ink); font-weight: 700; }
    .result-divider { margin: 0 7px; color: var(--line); }
    .clear-filters { border: 0; background: transparent; color: var(--rust); font: inherit; font-size: 10px; }
    .clear-filters span { margin-right: 5px; font-size: 15px; vertical-align: middle; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--line); }
    .page-info { color: var(--muted); font-size: 11px; }
    .page-button {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border: 1px solid var(--line);
      background: var(--paper);
      color: var(--ink);
      font: inherit;
      font-size: 16px;
    }
    .page-button:disabled { opacity: .4; cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .product-list-container {
        width: min(100% - 32px, 1180px);
        padding: 30px 0 55px;
      }
      .catalog-heading { min-height: 120px; }
      .catalog-heading h1 { font-size: 25px; }
      .catalog-stamp { width: 82px; height: 62px;
      }
      .catalog-toolbar { align-items: stretch; flex-direction: column; }
      .search-box { width: 100%; }
      .stock-filter { align-self: flex-start;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  protected readonly locale = inject(LanguageService);

  protected t(key: string): string {
    const messages: Record<string, [string, string]> = {
      productsTitle: ['منوی کافه', 'Cafe menu'],
      productsDescription: ['انتخابی تازه از طعم‌های محبوب ما', 'Explore our selection of cafe favorites'],
      catalogEyebrow: ['از دل آشپزخانه', 'From our kitchen'],
      freshDaily: ['تازه، هر روز', 'Fresh every day'],
      catalogFilters: ['جست‌وجو و فیلترهای منو', 'Menu search and filters'],
      catalogCategories: ['دسته‌بندی محصولات', 'Product categories'],
      searchProducts: ['جست‌وجو در منو...', 'Search the menu...'],
      clearSearch: ['پاک کردن جست‌وجو', 'Clear search'],
      allCategories: ['همه دسته‌بندی‌ها', 'All categories'],
      inStockOnly: ['فقط موارد موجود', 'In stock only'],
      clearFilters: ['پاک کردن فیلترها', 'Clear filters'],
      loadError: ['بارگذاری منو انجام نشد. دوباره تلاش کن.', 'Could not load the menu. Please try again.'],
      showing: ['نمایش', 'Showing'],
      of: ['از', 'of'],
      products: ['محصول', 'items'],
      previous: ['قبلی', 'Previous'],
      page: ['صفحه', 'Page'],
      next: ['بعدی', 'Next'],
    };
    return messages[key]?.[this.locale.language() === 'fa' ? 0 : 1] ?? key;
  }

  // State signals
  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly categories = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter state
  searchTerm = '';
  selectedCategory = '';
  inStockOnly = false;

  // Computed values
  readonly hasMorePages = computed(() => this.totalPages() > 1);

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productsService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ProductFilter = {};

    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }
    if (this.selectedCategory) {
      filter.category = this.selectedCategory;
    }
    if (this.inStockOnly) {
      filter.inStock = true;
    }

    this.productsService.getProducts(filter, this.currentPage(), 12).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalProducts.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
        console.error('Error loading products:', err);
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.onFilterChange();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.inStockOnly = false;
    this.onFilterChange();
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale.language() === 'fa' ? 'fa-IR' : 'en-US').format(value);
  }

  onProductSelect(product: Product) {
    this.router.navigate(['/products', product.id]);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadProducts();
    }
  }
}