import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JsonToFormService } from '../../services/json-to-form.service';
import { Observable } from 'rxjs';
import { JsonToFormListComponent } from '../../components/json-to-form-list/json-to-form-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-json-to-form',
  templateUrl: './json-to-form.component.html',
  styleUrls: ['./json-to-form.component.css'],
  imports: [JsonToFormListComponent, AsyncPipe],
})
export class JsonToFormComponent implements OnInit {
  private router = inject(Router);
  private jsonToFormService = inject(JsonToFormService);
  public formExamples$: Observable<any> = this.jsonToFormService.getExamples();

  constructor() {}

  ngOnInit(): void {}

  onCreate(): void {
    this.router.navigate(['json-to-form', 'create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['json-to-form', id, 'edit']);
  }
}
