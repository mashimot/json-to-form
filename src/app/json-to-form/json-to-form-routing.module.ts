import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonToFormFormComponent } from './json-to-form-form/json-to-form-form.component';
import { JsonToFormComponent } from './json-to-form.component';

const routes: Routes = [
  {
    path: '',
    component: JsonToFormComponent
  },
  {
    path: 'create',
    component: JsonToFormFormComponent
  },
  {
    path: ':id/edit',
    component: JsonToFormFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JsonToFormRoutingModule { }
