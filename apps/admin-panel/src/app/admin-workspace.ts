import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface AdminProduct {
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}

interface CafeOrder {
  id: string;
  customer: string;
  items: string;
  total: number;
  time: string;
  status: 'new' | 'preparing' | 'ready';
}

interface CafeTable {
  id: string;
  name: string;
  seats: number;
  status: 'available' | 'reserved' | 'occupied';
  updatedAt: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-admin-workspace',
  templateUrl: './admin-workspace.html',
  styleUrl: './admin-workspace.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWorkspace {
  private readonly http = inject(HttpClient);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly page = inject(ActivatedRoute).snapshot.data['page'] as 'product' | 'category' | 'orders' | 'tables';
  protected readonly categories = this.readList('menu-hub-admin-categories', ['قهوه', 'صبحانه', 'غذای اصلی', 'دسر']);
  protected readonly products = this.readList<AdminProduct>('menu-hub-admin-products', []);
  protected readonly orders = this.readList<CafeOrder>('menu-hub-admin-orders', []);
  protected readonly tables = this.readList<CafeTable>('menu-hub-admin-tables', []);
  protected productName = '';
  protected productCategory = this.categories[0] ?? '';
  protected productPrice: number | null = null;
  protected productDescription = '';
  protected categoryName = '';
  protected categoryDescription = '';
  protected available = true;
  protected savedMessage = '';
  protected tableName = '';
  protected tableSeats = 4;
  protected tableError = '';

  protected get title(): string {
    return this.page === 'product' ? 'افزودن محصول' : this.page === 'category' ? 'دسته‌بندی‌ها' : this.page === 'tables' ? 'مدیریت میزها' : 'سفارش‌های دریافتی';
  }

  protected get newOrdersCount(): number {
    return this.orders.filter(order => order.status === 'new').length;
  }

  protected get totalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  protected get availableTables(): number { return this.tables.filter(table => table.status === 'available').length; }
  protected get occupiedTables(): number { return this.tables.filter(table => table.status === 'occupied').length; }
  protected get reservedTables(): number { return this.tables.filter(table => table.status === 'reserved').length; }

  ngOnInit(): void {
    if (this.page === 'tables') {
      this.http.get<{ data: CafeTable[] }>('http://localhost:3333/api/tables').subscribe({
        next: response => {
          this.tables.splice(0, this.tables.length, ...response.data);
          this.persist('menu-hub-admin-tables', this.tables);
          this.changeDetector.markForCheck();
        },
      });
      return;
    }
    if (this.page !== 'orders') return;
    this.http.get<{ data: Array<CafeOrder & { createdAt?: string }> }>('http://localhost:3333/api/orders')
      .subscribe({
        next: response => {
          this.orders.splice(0, this.orders.length, ...response.data.map(order => ({
            ...order,
            time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '',
          })));
          this.persist('menu-hub-admin-orders', this.orders);
          this.changeDetector.markForCheck();
        },
      });
  }

  protected saveProduct(): void {
    if (!this.productName.trim() || !this.productCategory || !this.productPrice) return;
    this.products.unshift({
      name: this.productName.trim(),
      category: this.productCategory,
      price: this.productPrice,
      description: this.productDescription.trim(),
      available: this.available,
    });
    this.persist('menu-hub-admin-products', this.products);
    this.http.post('http://localhost:3333/api/products', {
      name: this.products[0].name,
      category: this.products[0].category,
      price: this.products[0].price,
      description: this.products[0].description,
      imageUrl: '',
      inStock: this.products[0].available,
    }).subscribe();
    this.savedMessage = 'محصول با موفقیت به منو اضافه شد';
    this.productName = '';
    this.productPrice = null;
    this.productDescription = '';
    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  protected saveCategory(): void {
    const name = this.categoryName.trim();
    if (!name || this.categories.includes(name)) return;
    this.categories.push(name);
    this.persist('menu-hub-admin-categories', this.categories);
    this.http.post('http://localhost:3333/api/products-metadata/categories', { name })
      .subscribe();
    this.savedMessage = 'دسته‌بندی جدید ساخته شد';
    this.categoryName = '';
    this.categoryDescription = '';
    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  protected advanceOrder(order: CafeOrder): void {
    order.status = order.status === 'new' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'ready';
    this.persist('menu-hub-admin-orders', this.orders);
    this.http.patch(`http://localhost:3333/api/orders/${order.id}/status`, { status: order.status }).subscribe();
  }

  protected statusLabel(status: CafeOrder['status']): string {
    return status === 'new' ? 'جدید' : status === 'preparing' ? 'در حال آماده‌سازی' : 'آماده تحویل';
  }

  protected nextAction(status: CafeOrder['status']): string {
    return status === 'new' ? 'شروع آماده‌سازی' : status === 'preparing' ? 'آماده تحویل' : 'تکمیل شد';
  }

  protected tableStatusLabel(status: CafeTable['status']): string {
    return status === 'available' ? 'آزاد' : status === 'reserved' ? 'رزرو شده' : 'مشغول';
  }

  protected tableStatusAction(status: CafeTable['status']): string {
    return status === 'available' ? 'ثبت اشغال میز' : status === 'occupied' ? 'آزاد کردن میز' : 'تبدیل به مشغول';
  }

  protected cycleTableStatus(table: CafeTable): void {
    const status: CafeTable['status'] = table.status === 'available'
      ? 'occupied'
      : table.status === 'occupied' ? 'available' : 'occupied';
    this.updateTableStatus(table, status);
  }

  protected toggleReservation(table: CafeTable): void {
    this.updateTableStatus(table, table.status === 'reserved' ? 'available' : 'reserved');
  }

  protected addTable(): void {
    const name = this.tableName.trim();
    if (!name || this.tableSeats < 1 || this.tableSeats > 20 || this.tables.some(table => table.name === name)) {
      this.tableError = 'نام میز تکراری یا ظرفیت نامعتبر است.';
      return;
    }
    this.http.post<{ data: CafeTable }>('http://localhost:3333/api/tables', { name, seats: this.tableSeats }).subscribe({
      next: response => {
        this.tables.push(response.data);
        this.persist('menu-hub-admin-tables', this.tables);
        this.tableName = '';
        this.tableSeats = 4;
        this.tableError = '';
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.tableError = 'ساخت میز جدید انجام نشد.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private updateTableStatus(table: CafeTable, status: CafeTable['status']): void {
    const previousStatus = table.status;
    table.status = status;
    table.updatedAt = new Date().toISOString();
    this.changeDetector.markForCheck();
    this.http.patch<{ data: CafeTable }>(`http://localhost:3333/api/tables/${table.id}/status`, { status }).subscribe({
      next: response => {
        Object.assign(table, response.data);
        this.persist('menu-hub-admin-tables', this.tables);
        this.changeDetector.markForCheck();
      },
      error: () => {
        table.status = previousStatus;
        this.tableError = 'ذخیره وضعیت میز انجام نشد. دوباره تلاش کن.';
        this.changeDetector.markForCheck();
      },
    });
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(price);
  }

  private readList<T>(key: string, fallback: T[]): T[] {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) as T[] : fallback;
    } catch {
      return fallback;
    }
  }

  private persist<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}