import { ValidatorDefinition } from './validator-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';
import { Injectable } from '@angular/core';

interface Rules {
  [name: string]: any;
}

interface Options {
  formName: string;
  triggerValidationOnSubmit?: boolean;
  container?: 'container' | 'container-fluid';
  componentName: string;
}

/*@Injectable({
  providedIn: 'root'
})*/
export class ReactiveDrivenValidator {

  attribute!: string;
  parameters?: any;
  rules!: any;
  getDefinitions: any = [];
  getters: any = [];
  _options: Options = {
      formName: 'form',
      triggerValidationOnSubmit: true,
      componentName: '',
      container: 'container'
  };
  componentName!: string;
  
  constructor(rules: any, componentName: string) {
    this.componentName = componentName;
    this.setRules(rules);
  }

  public generate() {
    return [
        `this.${this._options.formName} = this.formBuilder.group({`,
        this.reactiveDrivenValidators(this.rules),
        `});`
    ];
  }

  public generateComponent() : string[] {
      let initVariables: string[] = [];
      let initObservables: string[] = [];
      let definitions: string[] = [];
      
      let init: string[] = this.generate();
      
      this.getters.forEach((item: any) => {
          if(item.get){
              item.get.forEach((currentGet: any) => {
                  definitions.push(currentGet.get_function);
                  definitions.push(currentGet.delete_function);
                  definitions.push(currentGet.create_function);
              })
          }
          if(item.mock_data){
              definitions.push([
                  `${item.mock_data.get_name}$(){`,
                  `return of(${JSON.stringify(item.mock_data.values)})`,
                  `.pipe(
                      delay(2000)
                  )`,
                  `}`
              ].join("\n"));
              initVariables.push(`${item.mock_data.parameter_name}$!: Observable<any>;`);
              initObservables.push(`${item.mock_data.parameter_name}$ = this.${item.mock_data.get_name}$();`);
          }
      });
      
      let component = [
          `import { Component, OnInit } from '@angular/core'`,
          `import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms'`,
          `import { Observable, of } from 'rxjs';`,
          `import { delay } from 'rxjs/operators';`,
          `
          @Component({
              selector: 'app-${this.componentName}',
              templateUrl: './${this.componentName}.component.html',
              styleUrls: ['./${this.componentName}.component.css']
          })
          export class ${ValidatorRuleHelper.camelCasedString(this.componentName)}Component implements OnInit {              
              ${this._options.formName}!: FormGroup;
              formSubmitAttempt: boolean = false;
              ${initVariables.join(";\n")}
              constructor(
                  private formBuilder: FormBuilder
              ) { }

              ngOnInit(): void {
                  ${`${initObservables.map((v) =>  `this.${v}`).join("\n")}`}
                  ${init.join("\n")}
              }
              
              onSubmit(): void {
                  this.formSubmitAttempt = true;
                  if (this.f.valid) {
                      console.log('form submitted');
                  } else {
                      this.validateAllFormFields(this.f);
                  }
              }

              validateAllFormFields(control: AbstractControl) {
                  if (control instanceof FormControl) {
                      control.markAsTouched({ onlySelf: true });
                  } else if (control instanceof FormGroup) {
                      Object.keys(control.controls).forEach((field: string) => {
                          const groupControl = control.get(field)!;
                          this.validateAllFormFields(groupControl);
                      });
                  } else if (control instanceof FormArray) {
                      const controlAsFormArray = control as FormArray;
                      controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
                  }
              }

              get f(){
                  return this.form;
              }

              isFieldValid(field: string) {
                  return !this.f.get(field)?.valid && this.f.get(field)?.touched;
              }

              getField(field: string) {
                  return this.f.get(field);
              }

              ${definitions.join("\n")}                
          `
      ];
      
      component.push("}");
      return component;
  }

  protected reactiveDrivenValidators(object: any, names: string = '', parameters: string[] = []): string {
      return Object.keys(object).map((key: any) => {
          let value = object[key];
          let rest = names.length ? '.' + key : key;
          let completeKeyName = (names + rest).split('.');
          let dot_notation = ValidatorRuleHelper.dotNotation(completeKeyName);
          let definition = null;
          let n = key.split('.');
          let firstNameBeforeDot = n[0];
          //value: can be an array ['required', 'min:40'] or an object {}
          let isValueAnArray = Array.isArray(value) ? true : false;

          //key has asterisk, so must turn into an array
          if (completeKeyName[completeKeyName.length - 1] == '*') {
              let index = 0;
              for (var i = completeKeyName.length - 1; i >= 0; i--) {
                  if (completeKeyName[i] != '*') {
                      break;
                  }
                  let rand = ValidatorRuleHelper.camelCasedString(n.join(""));
                  rand = `index${rand}${index == 0 ? '' : index}`;
                  parameters.push(rand);
                  index++;
              }
              let formBuilderGroup:any = [];

              //"key.*": ['required', 'min:10']
              if(isValueAnArray){
                  let rules = value;
                  let parameters = rules.reduce((parameters: string[], rule: any) => {
                      let parsed = ValidatorRuleHelper.parseStringRule(rule);
                      this.attribute = parsed[0];
                      this.parameters = parsed[1];
                      let attr_get = this.get();
                      if (attr_get != '') {
                          parameters.push(attr_get);
                      }

                      return parameters;
                  }, []);

                  formBuilderGroup = [`this.formBuilder.control('', [${parameters.join(",")}]);`];            
              } else { //"key.*": { "any: ['required', 'min:10']" }
                  formBuilderGroup = [
                      `this.formBuilder.group({`,
                      `${this.reactiveDrivenValidators(value, names + rest, parameters)}`,
                      `})`,
                  ];
              }

              definition = ValidatorDefinition.get({
                  completeKeyName: completeKeyName,
                  name: firstNameBeforeDot,
                  parameters: parameters,
                  formBuilderGroup: formBuilderGroup,
                  //isValueAnArray: isValueAnArray
              });

              this.getters.push(definition);
          }
          
          //key: { any: [], any2.*: [] }
          if (Object.prototype.toString.call(value) == '[object Object]') {
              //key has asterisk
              if (completeKeyName[completeKeyName.length - 1] == '*') {
                  parameters = ValidatorRuleHelper.removeParameters(n, parameters);

                  return [
                      `"${firstNameBeforeDot}":`,
                      definition.formBuilder.join("\n"),
                  ]
                  .join('\n');
              }

              return [
                  `"${key}": this.formBuilder.group({`,
                  `${this.reactiveDrivenValidators(value, names + rest, parameters)}`,
                  `}),`
              ]
              .join('\n');
          }

          //key: ['max:40']
          if (Array.isArray(value)) {
              let rules = value;
              let ruleParameters = rules.reduce((parameters: string[], rule: any) => {
                  const parsed = ValidatorRuleHelper.parseStringRule(rule);
                  this.attribute = parsed[0];
                  this.parameters = parsed[1];
                  let attr_get = this.get();
                  if (attr_get != '') {
                      parameters.push(attr_get);
                  }

                  return parameters;
              }, []);
              let values = rules.reduce((accArr, rule) => {
                  let parsed = ValidatorRuleHelper.parseStringRule(rule);
                  if (parsed[0] == 'in') {
                      //accArr = parsed[1][0].split(",");
                      accArr = parsed[1];
                      console.log('parsed', parsed);
                  }

                  if(parsed[0] == 'html'){
                      if(['select', 'radio', 'checkbox'].includes(parsed[1][0])){
                          if(parsed[0] != 'in'){
                              accArr = [{
                                  id: 1,
                                  mock: 1
                              },{
                                  id: 2,
                                  mock: 2
                              },{
                                  id: 3,
                                  mock: 3
                              }];
                          }
                      }
                  }

                  return accArr;
              }, []);

              if(values.length > 0){
                  this.getters.push({
                      mock_data: {
                          parameter_name: ValidatorRuleHelper.camelCasedString(dot_notation.join("."), true),
                          get_name: `get${ValidatorRuleHelper.camelCasedString(dot_notation.join("."))}`,
                          values: values
                      }
                  })
              }
              
              parameters = ValidatorRuleHelper.removeParameters(n, parameters);
      
              if(definition != null){ //key has asterisk
                  return `"${firstNameBeforeDot}": ${definition.formBuilder.join("\n")}`;
              }
              
              return `"${key}": ['', [${ruleParameters.join(",")}]],`
          }

          return '';
      }).join("\n");
  }

  private setRules(rules: Rules) {
      this.rules = ValidatorRuleHelper.splitRules(rules);
  }

  public get(): string {
      
      if (this.attribute == 'min') {
          return this.validateMin();
      }
      if (this.attribute == 'max') {
          return this.validateMax();
      }
      if (this.attribute == 'required') {
          return this.validateRequired();
      }
      if (this.attribute == 'email') {
          return this.validateEmail();
      }
      if (this.attribute == 'between_length') {
          return this.validateBetweenLength();
      }

      return '';
  }

  public validateBetweenLength() : string
  {
      return `ArrayValidators.betweenLength(${this.parameters[0]})`;
  }

  public validateMax() : string
  {
      return `Validators.maxLength(${this.parameters[0]})`;
  }

  public validateEmail() : string
  {
      return `Validators.email`;
  }
  
  public validateMin() : string
  {
      return `Validators.minLength(${this.parameters[0]})`;
  }
  
  public validateRequired() : string
  {
      return `Validators.required`;
  }
}