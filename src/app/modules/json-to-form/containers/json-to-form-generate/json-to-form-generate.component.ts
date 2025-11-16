import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { JsonToFormFormComponent } from '../../components/json-to-form-form/json-to-form-form.component';
import { JsonToFormService } from '../../services/json-to-form.service';

@Component({
  selector: 'app-json-to-form-generate',
  templateUrl: './json-to-form-generate.component.html',
  styleUrls: ['./json-to-form-generate.component.scss'],
  imports: [JsonToFormFormComponent, AsyncPipe],
})
export class JsonToFormGenerateComponent implements OnInit {
  private jsonToFormService = inject(JsonToFormService);
  private route = inject(ActivatedRoute);

  public formExample$!: Observable<any>;

  constructor() {}

  ngOnInit(): void {
    this.getFormExamples();
  }

  public getFormExamples() {
    this.formExample$ = this.route.paramMap.pipe(
      map((paramMap) => paramMap.get('id')),
      filter((id) => id != null),
      switchMap((id) => this.jsonToFormService.getExampleByNumber(Number(id))),
    );
  }
}
