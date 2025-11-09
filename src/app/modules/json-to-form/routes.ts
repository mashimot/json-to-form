import { Routes } from '@angular/router';
import { JsonToFormGenerateComponent } from './containers/json-to-form-generate/json-to-form-generate.component';
import { JsonToFormComponent } from './containers/json-to-form/json-to-form.component';

export const routes: Routes = [
  {
    path: '',
    component: JsonToFormComponent,
  },
  {
    path: 'create',
    component: JsonToFormGenerateComponent,
  },
  {
    path: ':id/edit',
    component: JsonToFormGenerateComponent,
  },
];
