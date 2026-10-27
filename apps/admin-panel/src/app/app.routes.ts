import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{ path: '', pathMatch: 'full', redirectTo: 'products/new' },
	{
		path: 'products/new',
		loadComponent: () => import('./admin-workspace').then(m => m.AdminWorkspace),
		data: { page: 'product' },
	},
	{
		path: 'categories/new',
		loadComponent: () => import('./admin-workspace').then(m => m.AdminWorkspace),
		data: { page: 'category' },
	},
	{
		path: 'orders',
		loadComponent: () => import('./admin-workspace').then(m => m.AdminWorkspace),
		data: { page: 'orders' },
	},
	{
		path: 'tables',
		loadComponent: () => import('./admin-workspace').then(m => m.AdminWorkspace),
		data: { page: 'tables' },
	},
	{ path: '**', redirectTo: 'products/new' },
];
