import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { JsonToFormService } from '../../services/json-to-form.service';

@Component({
  selector: 'app-json-to-form-generate',
  templateUrl: './json-to-form-generate.component.html',
  styleUrls: ['./json-to-form-generate.component.scss']
})
export class JsonToFormGenerateComponent implements OnInit {
  public formExample$!: Observable<any>;

  constructor(
    private jsonToFormService: JsonToFormService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formExample$ = this.route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        filter(id => id != null),
        switchMap(id => this.jsonToFormService.getExampleByNumber(Number(id)))
      );
  }

}
