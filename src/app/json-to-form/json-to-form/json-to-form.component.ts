import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { JsonToFormExampleService } from '../json-to-form-example.service';

@Component({
    selector: 'app-json-to-form',
    templateUrl: './json-to-form.component.html',
    styleUrls: ['./json-to-form.component.css']
})
export class JsonToFormComponent implements OnInit {
    formRandomJsonExample: any;
    formUserJsonExample: any;
    formExamples: any;
    
    constructor(
      private jsonToFormExample: JsonToFormExampleService
    ) {
    }

    ngOnInit(): void {
      this.formExamples = this.jsonToFormExample.getExamples();
      this.formRandomJsonExample = this.jsonToFormExample.randomJson();
      this.formUserJsonExample = this.jsonToFormExample.usersJson();
    }


    onSubmit(): void {
    }

}