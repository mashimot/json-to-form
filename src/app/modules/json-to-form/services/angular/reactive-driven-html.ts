import { Definition } from './models/Definition';
import { FunctionDefinition } from './function-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

export class ReactiveDrivenHtml {
  rules!: any;
  triggerValidationOnSubmit: boolean = true;
  formName: string = 'form';

  constructor(rules: Rules) {
    this.setRules(rules);
  }

  public setFormName(formName: string): void {
    this.formName = formName;
  }

  public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
    this.triggerValidationOnSubmit = triggerValidationOnSubmit;
  }

  public generate() : string[] {
    return [
      `<form [formGroup]="${this.formName}" (ngSubmit)="onSubmit()">`,
        `<pre>{{ ${this.formName}.value | json }}</pre>`,
          this.reactiveDrivenHtml(this.rules),
        `<button type="submit" class="btn btn-primary">`,
        `Submit`,
        `</button>`,
      `</form>`,
    ];
  }

  public dotNotation: string[] = [];

  public reactiveDrivenHtml(object: { [key: string]: any }, names: string = '', parameters: string[] = [], nestedFormArray: any = []): string {
    let drivenHtml = Object.keys(object)
      .map((key: string) => {
        const value = object[key];
        const isValueAnArray = Array.isArray(value);
        const isValueAnObject = Object.prototype.toString.call(value) === '[object Object]';
        const rest = names.length ? '.' + key : key;
        const completeKeyName = (names + rest).split('.');
        const completeKeyNameEndsWithAsterisk = completeKeyName[completeKeyName.length - 1] === '*'
            ? true
            : false;
        const dotNotation = ValidatorRuleHelper.dotNotation(completeKeyName);
        const keyNameSplit = key.split('.');
        const firstKeyNameBeforeDot = keyNameSplit[0];
        let functionDefinition: Definition = {
            get: [],
            formBuilder: []
        };
        this.dotNotation = dotNotation;

        if (key.trim().startsWith('$')) {
          return '';
        }
       
        if (completeKeyNameEndsWithAsterisk) {
			parameters = [ ...parameters, ...ValidatorRuleHelper.defineIndexName(completeKeyName, keyNameSplit) ];
			functionDefinition = new FunctionDefinition(
				parameters,
				completeKeyName
			)
			.get();

			if(functionDefinition.get.length > 0){
				nestedFormArray.push(functionDefinition.get[functionDefinition.get.length - 1]);
			}
        }

        //ex: { keyName: {} }
        if (isValueAnObject) {
          if (!completeKeyNameEndsWithAsterisk){
            return [
              `<div formGroupName="${key}">`,
              `${this.reactiveDrivenHtml(value, names + rest, parameters, nestedFormArray)}`,
              `</div>`
            ]
            .join('\n');
          }

          //ex: { keyName.*: {} }{
          const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
            functionDefinition, firstKeyNameBeforeDot, isValueAnObject
          );
          const FORM_ARRAY: string[] = [
            formArrayOpenTag.join("\n"),
              this.reactiveDrivenHtml(value, names + rest, parameters, nestedFormArray),
            formArrayCloseTag.join("\n"),
          ];
         
          //refresh the parameters list
          parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
          nestedFormArray.pop();

          return FORM_ARRAY.join("\n");
        }
       
        //ex: { keyName: [] }
        if (isValueAnArray) {
          const rules = value;
          const keyNameDotNotation: string = completeKeyName.join(".");
          let formControlName = 'formControlName';
          let getField = ValidatorRuleHelper.camelCasedString(
            this.dotNotation.filter((el: string) => el !== '*').join(""),
            true    
          );
          let isFieldValid = `isFieldValid('${keyNameDotNotation}')`;
          let id = this.dotNotation[this.dotNotation.length - 1];
          let index = firstKeyNameBeforeDot;

          //key has asterisk
          if (nestedFormArray.length > 0) {
            const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
            let getId = `.get('${id}')`;

            if(id === '*'){
              getId = '';
              formControlName = '[formControlName]';
              index = lastFormArray.get('last_index');
            }
            getField = `${lastFormArray.get('get_at')}${getId}`;
            isFieldValid = `!${getField}?.valid`
          }

          const ngClass = `[class.is-invalid]="${isFieldValid}"`;
          const keyNameWithoutAsterisk = this.dotNotation.filter((el:string) => el !== '*').join("");
          const newIndex = id === '*' ? `{{ ${index} }}` : index;
          let INPUTS: {
            [key:string]: string
          } = {
            text: `<input type="text" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            file: `<input type="file" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            password: `<input type="password" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            email: `<input type="email" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            number: `<input type="number" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            date: `<input type="date" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
            textarea: `<textarea ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" cols="30" rows="10" ${ngClass}></textarea>`,
            select: [
              `<select ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                `<option *ngFor="let data of (${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async)" [ngValue]="data">`,
                `{{ data | json }}`,
                `</option>`,
              `</select>`
            ].join('\n'),
            radio: [
              `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as asyncData">`,
                `<div *ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)} = index;">`,
                  `<div class="form-check">`,
                    `<input type="radio" formControlName="${newIndex}" [value]="data" ${ngClass}>{{ data | json }}`,
                  `</div>`,
                `</div>`,
              `</div>`
            ].join('\n'),
            checkbox: [
              `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as asyncData">`,
                `<div *ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)} = index;">`,                                    
                  `<div class="form-check">`,
                    `<input type="checkbox" ${formControlName}="${index}" class="form-check-input" ${ngClass} [value]="data"> {{ data }}`,
                  `</div>`,
                `</div>`,
              `</div>`
            ].join('\n')
          };

          const FORM = rules.reduce((form: any, rule: any) => {
            const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

            if (ruleName === 'html') {
              form.input = INPUTS[ruleParameters[0]] || INPUTS.text;
            }

            form.validators.push(
              this.getErrorsMessages({ ruleName, ruleParameters, getField, keyNameDotNotation })
            );

            return form;
          }, {
            validators: [],
            input: INPUTS.text
          });

          //ex.*: { keyName: [] }
          if (completeKeyNameEndsWithAsterisk) {
            const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
              functionDefinition, firstKeyNameBeforeDot, isValueAnObject
            );
            
            parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
            nestedFormArray.pop();

            return [
              ...formArrayOpenTag,
              `<div class="form-group col-md-12">`,
                `<label for="${id}">${keyNameDotNotation}</label>`,
                `<div class="input-group">`,
                  `${FORM.input}`,
                  //deleteButton.length > 0 ? deleteButton[deleteButton.length - 1] : '',
                  `<div *ngIf="${isFieldValid}" class="invalid-feedback">`,
                    `${FORM.validators.join("")}`,
                  `</div>`,
                `</div>`,
              `</div>`,
              ...formArrayCloseTag
            ].join("\n");
          }

          return [
            `<div class="form-group">`,
              `<label for="${id}">${keyNameDotNotation}</label>`,
              `${FORM.input}`,
              `<div *ngIf="${isFieldValid}" class="invalid-feedback">`,
                `${FORM.validators.join("")}`,
              `</div>`,
            `</div>`,
          ].join("\n");
        }

        return '';
      }).join("\n");

    return drivenHtml;
  }

  protected getErrorsMessages({ getField, ruleName, ruleParameters, keyNameDotNotation }: any){
    if (ruleName === 'required') {
      return `<div *ngIf="${getField}!.hasError('required')">${keyNameDotNotation.toUpperCase()} is required</div>`;
    }
    if (ruleName === 'min') {
      return `<div *ngIf="${getField}!.hasError('minlength')">${keyNameDotNotation.toUpperCase()} min must be ${ruleParameters[0]}</div>`
    }
    if (ruleName === 'max') {
      return `<div *ngIf="${getField}!.hasError('maxlength')">${keyNameDotNotation.toUpperCase()} max must be ${ruleParameters[0]}</div>`
    }
    if (ruleName === 'email') {
      return `<div *ngIf="${getField}!.hasError('email')">${keyNameDotNotation.toUpperCase()} an valid Email</div>`;
    }
   
    return '';
  }

  private setRules(rules: Rules) {
    this.rules = ValidatorRuleHelper.splitRules(rules);
  }

  private generateDeleteButton(item: Map<string, string>): string[] {
    return [
      `<div class="btn-group">`,
        `<button`,
          	`type="button"`,
            `(click)="${item.get('delete')}"`, 
            `class="btn btn-danger btn-sm"`,
        `>`,
          `<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>`,
          `DELETE ${item.get('function_name')}`,
        `</button>`,
      `</div>`
    ];
  }

  private generateAddButton(item: Map<string, string>): string[] {
    return [
      `<div class="btn-group">`,
        `<button`,
          `type="button" `,
          `class="btn btn-primary btn-block btn-sm" `,
          `(click)="${item.get('create')}"`,
        `>`,
          `<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>`,
          `ADD ${item.get('function_name')}`,
        `</button>`,
      `</div>`
    ];
  }

  private generateFormArray(
    functionDefinition: Definition, 
    firstKeyNameBeforeDot: string,
    isValueAnObject: boolean
  ): [string[], string[]] {
    const formArrayOpenTag: string[] = []
    const formArrayCloseTag: string[] = [];

    functionDefinition.get.forEach((item: Map<string, string>, i: number) => {
      const formArrayName: string = i <= 0
        ? `formArrayName="${firstKeyNameBeforeDot}"`
        : `[formArrayName]="${item.get('second_to_last_index')}"`;

      formArrayOpenTag.push(
        `<fieldset ${formArrayName}>
          ${this.generateAddButton(item).join("\n")}
          <div
            *ngFor="let ${item.get('function_name')}${i + 1}Data of ${item.get('get_with_parameters')}.controls; let ${item.get('last_index')} = index;"
            ${
              isValueAnObject === true && i === functionDefinition.get.length - 1
                ? `[formGroupName]="${item.get('last_index')}"`
                : ''
            }
          >
          `
      );
      formArrayOpenTag.push(this.generateDeleteButton(item).join("\n"));
      formArrayCloseTag.push('</div>');
      formArrayCloseTag.push('</fieldset>');
    });

    return [formArrayOpenTag, formArrayCloseTag];
  }
}