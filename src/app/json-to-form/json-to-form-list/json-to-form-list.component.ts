import { JsonToFormService } from './../../services/json-to-form.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-json-to-form-list',
  templateUrl: './json-to-form-list.component.html',
  styleUrls: ['./json-to-form-list.component.css']
})
export class JsonToFormListComponent implements OnInit {

  formRandomJsonExample: any;
  formUserJsonExample: any;
  formExamples: any;
  hoverEffect: string[] = [];
  
  constructor(
    private jsonToFormExample: JsonToFormService
  ) {
  }

  ngOnInit(): void {
    this.formExamples = this.jsonToFormExample.getExamples();
    this.formRandomJsonExample = this.jsonToFormExample.randomJson();
    this.formUserJsonExample = this.jsonToFormExample.usersJson();
  }
}
