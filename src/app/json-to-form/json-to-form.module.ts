import { FolderStructureModule } from './../folder-structure/folder-structure.module';
import { FolderStructureComponent } from './../folder-structure/folder-structure.component';
import { AppMaterialModule } from './../shared/app-material/app-material.module';
import { JsonToFormRoutingModule } from './json-to-form-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToFormFormComponent } from './json-to-form-form/json-to-form-form.component';
import { JsonToFormListComponent } from './json-to-form-list/json-to-form-list.component';
import { JsonToFormComponent } from './json-to-form.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonToFormGenerateComponent } from './json-to-form-generate/json-to-form-generate.component';

@NgModule({
  declarations: [
    JsonToFormComponent,
    JsonToFormFormComponent,
    JsonToFormListComponent,
    JsonToFormGenerateComponent,
    FolderStructureComponent
  ],
  imports: [
    CommonModule,
    JsonToFormRoutingModule,
    NgJsonEditorModule,
    AppMaterialModule,
    FolderStructureModule
  ],
  exports: [
    
  ]
})
export class JsonToFormModule { }
