import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToFormRoutingModule } from './json-to-form-routing.module';
import { JsonToFormComponent } from './json-to-form.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    JsonToFormComponent
  ],
  imports: [
    CommonModule,
    JsonToFormRoutingModule,
    ReactiveFormsModule
  ]
})
export class JsonToFormModule { }
