import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { MonitoringPage } from './app/pages/monitoring/monitoring';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [{ path: '', title: 'CO2Wall', component: MonitoringPage }]
    },

    { path: '**', redirectTo: '/notfound' }
];
