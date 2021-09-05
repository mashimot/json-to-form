import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonToFormComponent } from './json-to-form.component';

const routes: Routes = [
  {
    path: 'json-to-form',
    component: JsonToFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JsonToFormRoutingModule { }
