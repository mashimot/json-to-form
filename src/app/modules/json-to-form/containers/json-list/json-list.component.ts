import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';
import { JsonListItemComponent } from '../../components/json-list-item/json-list-item.component';
import { JsonToFormService } from '../../services/json-to-form.service';

@Component({
  selector: 'app-json-list',
  templateUrl: './json-list.component.html',
  styleUrls: ['./json-list.component.css'],
  imports: [JsonListItemComponent, AsyncPipe, ButtonModule],
})
export class JsonListComponent implements OnInit {
  private router = inject(Router);
  private jsonToFormService = inject(JsonToFormService);

  public formExamples$: Observable<any> = this.jsonToFormService.getExamples();

  constructor() {}

  ngOnInit(): void {}

  onCreateChange(): void {
    this.router.navigate(['json-to-form', 'create']);
  }

  onEditChange(id: number): void {
    this.router.navigate(['json-to-form', id, 'edit']);
  }
}
