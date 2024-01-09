import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JsonToFormService } from '../../services/json-to-form.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-json-to-form',
  templateUrl: './json-to-form.component.html',
  styleUrls: ['./json-to-form.component.css']
})
export class JsonToFormComponent implements OnInit {
  formExamples$: Observable<any> = this.jsonToFormService.getExamples();

  constructor(
    private router: Router,
    private jsonToFormService: JsonToFormService
  ) { }

  ngOnInit(): void {
  }

  onCreate(): void {
    this.router.navigate(['json-to-form', 'create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['json-to-form', id, 'edit']);
  }
}
