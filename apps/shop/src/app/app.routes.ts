import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./customer-portal').then(m => m.CustomerPortal),
    data: { page: 'auth' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./customer-portal').then(m => m.CustomerPortal),
    data: { page: 'dashboard' },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./customer-portal').then(m => m.CustomerPortal),
    data: { page: 'categories' },
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./customer-portal').then(m => m.CustomerPortal),
    data: { page: 'cart' },
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./customer-portal').then(m => m.CustomerPortal),
    data: { page: 'checkout' },
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-products').then(m => m.featureProductsRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-product-detail').then(
        m => m.featureProductDetailRoutes
      ),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
