import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgJsonEditorModule } from 'ang-jsoneditor';
// import { FolderStructureComponent } from './../folder-structure/folder-structure.component';
import { FolderStructureModule } from './../../folder-structure/folder-structure.module';
import { AppMaterialModule } from './../../shared/app-material/app-material.module';
import { JsonToFormFormComponent } from './components/json-to-form-form/json-to-form-form.component';
import { JsonToFormListComponent } from './components/json-to-form-list/json-to-form-list.component';
// import { JsonToFormFormArrayComponent } from './json-to-form-form-array/json-to-form-form-array.component';
import { JsonToFormGenerateComponent } from './containers/json-to-form-generate/json-to-form-generate.component';
import { JsonToFormComponent } from './containers/json-to-form/json-to-form.component';
import { JsonToFormRoutingModule } from './json-to-form-routing.module';
import { ReplacePipe } from './pipes/replace.pipe';

@NgModule({
  declarations: [
    JsonToFormComponent,
    JsonToFormFormComponent,
    // JsonToFormFormArrayComponent,
    JsonToFormListComponent,
    JsonToFormGenerateComponent,
    // FolderStructureComponent,
    ReplacePipe
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
