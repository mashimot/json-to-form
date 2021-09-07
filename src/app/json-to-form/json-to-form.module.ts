import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToFormRoutingModule } from './json-to-form-routing.module';
import { JsonToFormComponent } from './json-to-form/json-to-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { JsonToFormFormComponent } from './json-to-form-form/json-to-form-form.component';


@NgModule({
  declarations: [
    JsonToFormComponent,
    JsonToFormFormComponent
  ],
  imports: [
    CommonModule,
    JsonToFormRoutingModule,
    ReactiveFormsModule
  ]
})
export class JsonToFormModule { }
