import { ValidatorDefinition } from './validator-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

export class ReactiveDrivenHtml {
  rules!: any;
  attribute!: string;
  parameters?: any;
  triggerValidationOnSubmit: boolean = true;
  formName: string = 'form';

  constructor(rules: Rules) {
    this.setRules(rules);
  }

  public setFormName(formName: string): void {
      this.formName = formName
  }

  public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
      this.triggerValidationOnSubmit = triggerValidationOnSubmit;
  }

  public generate() : string[] {
      return [
          `<div class="container">`,
          `<form [formGroup]="${this.formName}" (ngSubmit)="onSubmit()">`,
          `<pre>{{ ${this.formName}.value | json }}</pre>`,
          this.reactiveDrivenHtml(this.rules),
          `<button type="submit" class="btn btn-primary">`,
          `Submit`,
          `</button>`,
          `</form>`,
          `</div>`
      ];
  }

  public dot_notation: any = [];

  public reactiveDrivenHtml(object: any, names: string = '', parameters: any = [], lastDefinition: any = []): string {
      let drivenHtml = Object.keys(object)
          .map((key: any) => {
              let value = object[key];
              let keyNameSplit = key.split('.');
              let firstKeyNameBeforedot = keyNameSplit[0];
              let definition:any = null;
              let rest = names.length > 0 ? '.' + key : key;
              let completeKeyName = (names + rest).split('.');
              this.dot_notation = ValidatorRuleHelper.dotNotation(completeKeyName);

              if (key.trim().startsWith('$')) {
                  return '';
              }
              
              if (completeKeyName[completeKeyName.length - 1] == '*') {
                  let index = 0;
                  for (let i = completeKeyName.length - 1; i >= 0; i--) {
                      if (completeKeyName[i] != '*') {
                          break;
                      }
                      let rand = ValidatorRuleHelper.camelCasedString(keyNameSplit.join(""));
                      rand = `index${rand}${index == 0 ? '' : index}`;
                      parameters.push(rand);
                      index++;
                  }
                  
                  definition = ValidatorDefinition.get({
                      completeKeyName: completeKeyName,
                      name: firstKeyNameBeforedot,
                      parameters: parameters
                  });
                  
                  if (Object.keys(definition.lastDefinition).length > 0) {
                      lastDefinition.push(definition);
                  }
              }

              if (Object.prototype.toString.call(value) == '[object Object]') {
                  if(completeKeyName[completeKeyName.length - 1] != '*'){
                      return [
                          `<div formGroupName="${key}">`,
                          `${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
                          `</div>`
                      ]
                      .join('\n');
                  }


                  let formArray: {
                      open: string[],
                      close: string[]
                  } = {
                      open: [],
                      close: []
                  }

                  definition.get.forEach((item: any, i: number) => {
                      const formArrayName: string = i <= 0
                          ? `formArrayName="${firstKeyNameBeforedot}"`
                          : `[formArrayName]="${item.second_to_last_index}"`;

                      formArray.open.push(
                          `<fieldset ${formArrayName} class="border border-dark p-2">
                              <pre>{{ ${item.get_with_parameters}.errors | json }}</pre>
                              <div class="d-grid gap-2">
                                  <button type="button" class="btn btn-primary btn-block btn-sm" (click)="${item.create}">ADD ${item.function_name}</button>
                              </div>
                              <div 
                                  *ngFor="let ${item.function_name}${i + 1} of ${item.get_with_parameters}.controls; let ${/*_parametersAux[pos + (i + 1)]*/ item.last_index} = index;"
                                  class="border border-dark p-2"
                                  ${i == definition.get.length - 1? `[formGroupName]="${item.last_index}"`: ``}
                              >
                                  <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                      <button type="button" class="btn btn-danger btn-sm" (click)="${item.delete}">DELETE ${item.function_name}</button>
                                  </div>`
                      );

                      formArray.close.push('</div>');
                      formArray.close.push('</fieldset>');
                  });

                  const FORM_ARRAY: string[] = [
                      formArray.open.join("\n"),
                          `${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
                      formArray.close.join("\n"),
                  ];
                  
                  //refresh the parameters list
                  parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
                  lastDefinition.pop();

                  return FORM_ARRAY.join("\n");
              }
              
              if (Array.isArray(value)) {
                  let messages: string[] = [];
                  const rules = value;
                  let keyNameDotNotation = completeKeyName.join(".");
                  let formControlName = 'formControlName';
                  let getField = `getField('${keyNameDotNotation}')`;
                  let isFieldValid = `isFieldValid('${keyNameDotNotation}')`;
                  let get:any = lastDefinition[lastDefinition.length - 1];
                  let id = this.dot_notation[this.dot_notation.length - 1];
                  var index = firstKeyNameBeforedot;
                  
                  //key has asterisk
                  if (lastDefinition.length > 0) {
                      let getId = `.get('${id}')`;

                      if(id == '*'){
                          getId = ''
                          formControlName = '[formControlName]';
                          index = get.lastDefinition.last_index;
                      } 
                      getField = `${get.lastDefinition.get_at}${getId}`;
                      isFieldValid = `!${getField}?.valid`
                  }

                  const ngClass = `[class.is-invalid]="${isFieldValid}"`
                  const defaultInput = [`<input type="text" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`].join('\n');
                  let input_html = defaultInput;

                  for (let i = 0; i < rules.length; i++) {
                      const rule = rules[i];
                      const parsed = ValidatorRuleHelper.parseStringRule(rule);
                      this.attribute = parsed[0];
                      this.parameters = parsed[1];
                      messages.push(
                          this.getErrorsMessages(getField, keyNameDotNotation)
                      );

                      if (this.attribute == 'html') {
                          let input: {
                              [key:string]: string
                          } = {
                              'file': `<input type="file" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                              'password': `<input type="password" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                              'email': `<input type="email" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                              'number': `<input type="number" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                              'date': `<input type="date" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                              'textarea': `<textarea ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" cols="30" rows="10" ${ngClass}></textarea>`
                          };
                          input_html = typeof input[this.parameters[0]] != 'undefined'
                              ? input[this.parameters[0]]
                              : defaultInput;

                          const keyNameWithoutAsterisk = this.dot_notation.filter((el:string) => el != '*').join("");
                          if (this.parameters[0] == 'select') {
                              const options = [
                                  `<option *ngFor="let data of (${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async)" [ngValue]="data">`,
                                  `{{ data | json }}`,
                                  `</option>`
                              ];
                              
                              input_html = `<select ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>${options.join("\n")}</select>`;
                          }
                          if (this.parameters[0] == 'radio') {    
                              if(id == '*'){
                                  index = `{{ ${index} }}`;
                              }
                              input_html = [
                                  `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as data$">`,
                                      `<div *ngFor="let data of data$; let index${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)} = index;">`,
                                          `<div class="form-check">`,
                                              `<input type="radio" formControlName="${index}" [value]="data" ${ngClass}>{{ data | json }}`,
                                          `</div>`,
                                      `</div>`,
                                  `</div>`
                              ].join("\n");
                          }
                          if (this.parameters[0] == 'checkbox') {       
                              input_html = [
                                  `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as data">`,
                                      `<div *ngFor="let d of data; let index${ValidatorRuleHelper.camelCasedString(id)} = index;">`,                                    
                                          `<div class="form-check">`,
                                              `<input type="checkbox" ${formControlName}="${index}" class="form-check-input" ${ngClass} [value]="d"> {{ d }}`,
                                          `</div>`,
                                      `</div>`,
                                  `</div>`
                              ].join("\n");
                          }
                      }                   
                  }

                  if (definition != null) {
                      parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
                      lastDefinition.pop();
                      let formArray: string[] = [];
                      definition.get.forEach((item: any, i: number) => {
                          let formArrayName: string = i <= 0
                              ? `formArrayName="${firstKeyNameBeforedot}"`
                              : `[formArrayName]="${item.second_to_last_index}"`;
                          formArray.push(
                              `<div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                  <button type="button" (click)="${item.get_with_parameters}.push(create${item.function_name}())" class="btn btn-primary btn-sm">add ${item.function_name}</button>
                              </div>
                              <div
                                  ${formArrayName}
                                  *ngFor="let h of ${item.get_with_parameters}!.controls; let ${item.last_index} = index;"
                              >
                                  <div class="form-group col-md-12">
                                      <label id="${id}">${keyNameDotNotation}</label>
                                      <div class="input-group mb-3">
                                          ${input_html}
                                          <button type="button" (click)="${item.delete}" class="btn btn-danger btn-sm">
                                              <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete
                                          </button>
                                          <div *ngIf="${isFieldValid}" class="invalid-feedback">
                                              ${messages.join("")}
                                          </div>
                                      </div>
                                  </div>
                              </div>`
                          );
                      });

                      return formArray.join("\n");
                  }

                  return [
                      `<div class="form-group col-md-12">`,
                          `<label id="${id}">${keyNameDotNotation}</label>`,
                          `${input_html}`,
                          `<div *ngIf="${isFieldValid}" class="invalid-feedback">`,
                              `${messages.join("")}`,
                          `</div>`,
                      `</div>`,
                  ].join("\n");
              }

              return '';
          }).join("\n");
  
      

      return drivenHtml;
  }

  protected getErrorsMessages(getField: string = '', objName: string): string {

      if (this.attribute == 'required') {
          return `<div *ngIf="${getField}!.errors?.required">${objName.toUpperCase()} is required</div>`;
      }
      if (this.attribute == 'min') {
          return `<div *ngIf="${getField}!.errors?.minlength">${objName.toUpperCase()} min must be ${this.parameters[0]}</div>`
      }
      if (this.attribute == 'max') {
          return `<div *ngIf="${getField}!.errors?.maxlength">${objName.toUpperCase()} max must be ${this.parameters[0]}</div>`
      }
      if (this.attribute == 'email') {
          return `<div *ngIf="${getField}!.errors?.email">${objName.toUpperCase()} an valid Email</div>`;
      }
      
      return '';
  }

  private setRules(rules: Rules) {
      this.rules = ValidatorRuleHelper.splitRules(rules);
  }
  
}