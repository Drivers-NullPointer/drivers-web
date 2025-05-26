import { Routes } from '@angular/router';
import { canActivateGuardHome } from './authentication/guard/home.guard';
import { canActivateGuardLogin } from './authentication/guard/login.guard';

export const routes: Routes = [
    {
        path: 'delete-account',
        loadComponent: () => import('./authentication/delete-account/delete-account.component').then(m => m.DeleteAccountComponent),
    },
    {
        path: 'terms-and-conditions',
        loadComponent: () => import('./home/conditions/conditions.component').then(m => m.ConditionsComponent),
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./home/privacity/privacity.component').then(m => m.PrivacityComponent),
    },
    {
        path: 'login',
        canActivate: [canActivateGuardLogin],
        loadComponent: () => import('./authentication/login/login.component').then(m => m.LoginComponent),

    },
    {
        path: '',
        loadComponent: () => import('./home/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [canActivateGuardHome],
        loadChildren: () => homeRoutes,
    },
    {
        path: 'verify-account',
        loadComponent: () => import('./authentication/verify-account/verify-account.component').then(m => m.VerifyAccountComponent),
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./authentication/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    },
    {
        path: 'send-reset-password',
        loadComponent: () => import('./authentication/send-reset-password/send-reset-password.component').then(m => m.SendResetPasswordComponent),
    },
    {
        path: '**',
        redirectTo: '',
    }
];



export const homeRoutes: Routes = [
    {
        path: '',
        redirectTo: 'drivers',
        pathMatch: 'full'
    },
    {
        path: 'drivers',
        loadComponent: () => import('./home/drivers/drivers.component').then(m => m.DriversComponent),
    },
    {
        path: 'vehicles',
        loadComponent: () => import('./home/vehicles/vehicles.component').then(m => m.VehiclesComponent),
    },
    {
        path: 'trips',
        loadComponent: () => import('./home/trips/trips.component').then(m => m.TripsComponent),
    },
    {
        path: 'clients',
        loadComponent: () => import('./home/clients/clients.component').then(m => m.ClientsComponent),
    },
    {
        path: 'requests',
        loadComponent: () => import('./home/request/request.component').then(m => m.RequestComponent),
    },
    {
        path: 'maps',
        loadComponent: () => import('./shared/maps/maps.component').then(m => m.MapsComponent),
    },

]