import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/json-to-form'
  },
  {
    path: 'json-to-form',
    loadChildren: () => import ("./modules/json-to-form/json-to-form.module").then(m => m.JsonToFormModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
