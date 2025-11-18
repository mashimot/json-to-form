import { Routes } from '@angular/router';
import { FormGeneratorContainerComponent } from './containers/form-generator-container/form-generator-container.component';
import { JsonListComponent } from './containers/json-list/json-list.component';

export const routes: Routes = [
  {
    path: '',
    component: JsonListComponent,
  },
  {
    path: 'create',
    component: FormGeneratorContainerComponent,
  },
  {
    path: ':id/edit',
    component: FormGeneratorContainerComponent,
  },
];
