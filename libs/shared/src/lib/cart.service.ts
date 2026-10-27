import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface CartLine {
  id: string;
  nameFa: string;
  nameEn: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ReceivedOrder {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  total: number;
  createdAt: string;
  status: 'new' | 'preparing' | 'ready';
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly lines = signal<CartLine[]>(this.read<CartLine[]>('menu-hub-cart', []));
  readonly lastOrder = signal<ReceivedOrder | null>(null);

  get itemCount(): number {
    return this.lines().reduce((sum, line) => sum + line.quantity, 0);
  }

  get total(): number {
    return this.lines().reduce((sum, line) => sum + line.price * line.quantity, 0);
  }

  add(line: Omit<CartLine, 'quantity'>): void {
    this.lines.update(lines => {
      const current = lines.find(item => item.id === line.id);
      if (current) return lines.map(item => item.id === line.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...lines, { ...line, quantity: 1 }];
    });
    this.saveCart();
  }

  setQuantity(id: string, quantity: number): void {
    this.lines.update(lines => quantity < 1
      ? lines.filter(line => line.id !== id)
      : lines.map(line => line.id === id ? { ...line, quantity } : line));
    this.saveCart();
  }

  remove(id: string): void {
    this.setQuantity(id, 0);
  }

  placeOrder(customer: string, phone: string, address: string): ReceivedOrder | null {
    if (!this.lines().length) return null;
    const orders = this.read<ReceivedOrder[]>('menu-hub-received-orders', []);
    const order: ReceivedOrder = {
      id: `NN-${Date.now().toString().slice(-6)}`,
      customer,
      phone,
      address,
      items: this.lines().map(line => `${line.quantity} × ${line.nameFa}`).join('، '),
      total: this.total,
      createdAt: new Date().toLocaleString('fa-IR'),
      status: 'new',
    };
    orders.unshift(order);
    this.write('menu-hub-received-orders', orders);
    if (isPlatformBrowser(this.platformId)) {
      fetch('http://localhost:3333/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          phone,
          address,
          items: order.items,
          total: order.total,
        }),
      }).catch(() => undefined);
    }
    this.lastOrder.set(order);
    this.lines.set([]);
    this.saveCart();
    return order;
  }

  private saveCart(): void {
    this.write('menu-hub-cart', this.lines());
  }

  private read<T>(key: string, fallback: T): T {
    if (!isPlatformBrowser(this.platformId)) return fallback;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(key, JSON.stringify(value));
  }
}