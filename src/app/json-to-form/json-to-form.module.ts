import { JsonToFormRoutingModule } from './json-to-form-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JsonToFormFormComponent } from './json-to-form-form/json-to-form-form.component';
import { JsonToFormListComponent } from './json-to-form-list/json-to-form-list.component';
import { JsonToFormComponent } from './json-to-form.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';

@NgModule({
  declarations: [
    JsonToFormComponent,
    JsonToFormFormComponent,
    JsonToFormListComponent
  ],
  imports: [
    CommonModule,
    JsonToFormRoutingModule,
    ReactiveFormsModule,
    NgJsonEditorModule
  ]
})
export class JsonToFormModule { }
