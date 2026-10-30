import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
{
    path: 'dashboard', title: 'Dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
},

    {
    path: 'cargar', title: 'Cargar factura', loadComponent: () => import('./features/cargar/cargar').then((m) => m.Cargar),
},

    {
    path: 'facturas', title: 'Facturas', loadComponent: () => import('./features/facturas/lista/lista').then((m) => m.Lista),
},

    {
    path: 'facturas/:id', title: 'Detalle de factura', loadComponent: () => import('./features/facturas/detalle/detalle').then((m) => m.Detalle),
},

    { path: '**', redirectTo: 'dashboard' },
];