import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ProjectsComponent } from '../lv/projects/projects.component';
import { ReelsComponent } from '../lv/reels/reels.component';
import { TableComponent } from '../lv/templates/table/table.component';
import { ComponentsPage } from './components/components';
import { MonitoringPage } from './monitoring/monitoring';

export default [
    { path: 'co2wall', title: 'CO2 Wall', component: MonitoringPage },
    { path: 'components', component: ComponentsPage },
    { path: 'reels', component: ReelsComponent },
    { path: 'projects', component: ProjectsComponent },
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
