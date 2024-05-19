import { Definition } from './models/Definition';
import { FunctionDefinition } from './function-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

enum FormEnum {
  FIELD = 'field',
  ABSCTRACT_CONTROL = `field.abstractControl`,
  IS_FIELD_VALID = `field.isFieldValid`,
  FIELD_ID = `field.id`,
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

  public reactiveDrivenHtml(
    object: { [key: string]: any },
    names: string = '',
    nestedFormArray: Array<Map<string, string>> = []
  ): string {
    const reactiveDrivenHtml = Object.keys(object)
      .map((key: string) => {
        const value = object[key];
        const isValueAnArray = Array.isArray(value);
        const isValueAnObject = Object.prototype.toString.call(value) === '[object Object]';
        const rest = names.length ? `.${key}` : key;
        const completeKeyName = (names + rest);
        const completeKeyNameSplitDot = completeKeyName.split('.');
        const completeKeyNameSplitDotEndsWithAsterisk = completeKeyNameSplitDot[completeKeyNameSplitDot.length - 1] === '*'
          ? true
          : false;
        const dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyNameSplitDot);
        const keyNameSplit = key.split('.');
        const firstKeyNameBeforeDot = keyNameSplit[0];
        let functionDefinition: Definition = {
            get: [],
            formBuilder: []
        };

        if (key.trim().startsWith('$')) {
          return '';
        }

        if (completeKeyNameSplitDotEndsWithAsterisk) {
          functionDefinition = new FunctionDefinition(completeKeyNameSplitDot).get();

          if (functionDefinition.get.length > 0) {
            nestedFormArray.push(functionDefinition.get[functionDefinition.get.length - 1]);
          }
        }

        //ex: { keyName: {} }
        if (isValueAnObject) {
          if (!completeKeyNameSplitDotEndsWithAsterisk){
            return [
              `<div [formGroupName]="'${key}'">`,
                `${this.reactiveDrivenHtml(value, completeKeyName, nestedFormArray)}`,
              `</div>`
            ]
            .join('\n');
          }

          //ex: { keyName.*: {} }{
          const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
            functionDefinition, firstKeyNameBeforeDot, isValueAnObject, completeKeyName
          );
          const FORM_ARRAY: string[] = [
            formArrayOpenTag.join("\n"),
              this.reactiveDrivenHtml(value, completeKeyName, nestedFormArray),
            formArrayCloseTag.join("\n"),
          ];
         
          nestedFormArray.pop();

          return FORM_ARRAY.join("\n");
        }
       
        //ex: { keyName: [] }
        if (isValueAnArray) {
          const validateAsString: boolean = true;
          const generateFormControlName = (): string => '[formControlName]';
          const generateGetField = (lastName: string, nestedFormArray: Array<Map<string, string>>, dotNotationSplit: string[]): string => {
            if(validateAsString){
              return `[${ValidatorRuleHelper.getField(completeKeyNameSplitDot)}]`;
            }
            
            if (nestedFormArray.length > 0) {
              const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
              return lastName === '*'
								? `${lastFormArray.get('get_at')}`
              	: `${lastFormArray.get('get_at')}.get('${lastName}')`;
            }

            return `f.get('${dotNotationSplit.filter((el: string) => el !== '*').join(".")}')`;
          };
          const generateFormInput = (
            INPUTS: { [key: string]: string }, 
            rules: string[]
          ) => {
            return rules.reduce((form: string, rule: string ) => {
              const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);
  
              if (ruleName === 'html') {
                form= INPUTS[ruleParameters[0]] || INPUTS.text;
              }
  
              return form;
            }, INPUTS.text);
          }
          const generateFormValidators = (
            rules: string[], 
            getField: string
          ) => {
            return rules.reduce((validators: string[], rule: string) => {
              const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);
  
              validators.push(
                this.getErrorsMessages({ ruleName, ruleParameters, getField })
              );
  
              return validators;
            }, []);
          }
          const getIndex = (firstKeyNameBeforeDot: string, nestedFormArray: Array<Map<string, string>>): string => {
            if (nestedFormArray.length > 0) {
              const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
              if(lastName === '*'){
                return `${lastFormArray.get('last_index')}`;
              }
            }

            return lastName === '*' ? firstKeyNameBeforeDot : `'${firstKeyNameBeforeDot}'`;
          }
          const rules = value;
          const lastName = dotNotationSplit[dotNotationSplit.length - 1];
          const index = getIndex(firstKeyNameBeforeDot, nestedFormArray);
          const formControlName = generateFormControlName();
          const getField = generateGetField(lastName, nestedFormArray, dotNotationSplit);
          const INPUTS = this.generateFormInput(
            formControlName,
            index,
						completeKeyNameSplitDot
          );
          const formInput = generateFormInput(INPUTS, rules);
          const formValidators = generateFormValidators(rules, `${FormEnum.ABSCTRACT_CONTROL}`);
          let formArrayOpenTag: string[] = [];
          let formArrayCloseTag: string[] = [];
          
          //ex.*: { keyName: [] }
          if (completeKeyNameSplitDotEndsWithAsterisk) {
            [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
              functionDefinition, firstKeyNameBeforeDot, isValueAnObject, completeKeyName
            );
            
            nestedFormArray.pop();
          }
  
          return [
            formArrayOpenTag.join(""),
            `<div class="form-group" *ngIf="getField(${getField}) as field">`,
              `<label [for]="${FormEnum.FIELD_ID}">{{ ${FormEnum.FIELD_ID} }}</label>`,
              `${formInput}`,
              `<div *ngIf="${FormEnum.IS_FIELD_VALID}" class="invalid-feedback">`,
                `${formValidators.join("")}`,
              `</div>`,
            `</div>`,
            formArrayCloseTag.join("")
          ]
          .filter(el => el)
          .join("\n");
        }

        return '';
      })
      .join("\n");

    return reactiveDrivenHtml;
  }

  protected getErrorsMessages({ getField, ruleName, ruleParameters }: any): string {
    if (ruleName === 'required') {
      return `<div *ngIf="${getField}!.hasError('required')">{{ ${FormEnum.FIELD_ID}.toUpperCase() }} is required</div>`;
    }
    if (ruleName === 'min') {
      return `<div *ngIf="${getField}!.hasError('minlength')">{{ ${FormEnum.FIELD_ID}.toUpperCase() }} min must be ${ruleParameters[0]}</div>`
    }
    if (ruleName === 'max') {
      return `<div *ngIf="${getField}!.hasError('maxlength')">{{ ${FormEnum.FIELD_ID}.toUpperCase() }} max must be ${ruleParameters[0]}</div>`
    }
    if (ruleName === 'email') {
      return `<div *ngIf="${getField}!.hasError('email')">{{ ${FormEnum.FIELD_ID}.toUpperCase() }} an valid Email</div>`;
    }
   
    return '';
  }

  private setRules(rules: Rules): void {
    this.rules = ValidatorRuleHelper.splitRules(rules);
  }

  private generateFormInput(
    formControlName: string,
    index: string,
		completeKeyNameSplitDot: string[]
  ): {
    [key: string]: string
  } {
		const dotNotation = ValidatorRuleHelper.dotNotation(completeKeyNameSplitDot);
		const async = `${ValidatorRuleHelper.camelCasedString(dotNotation.join("."), true)}`;
    const ngClass = `[class.is-invalid]="${FormEnum.IS_FIELD_VALID}"`;
    const input = ['text', 'file', 'password', 'email', 'number', 'date'].reduce(
      (form: { [key: string]: string }, type: string) => {
        form[type] = `<input type="${type}" ${formControlName}="${index}" [id]="${FormEnum.FIELD_ID}" class="form-control" ${ngClass}>`;
        return form;
      },
      {}
    );

    return {
      ...input,
      textarea: `<textarea ${formControlName}="${index}" [id]="${FormEnum.FIELD_ID}" class="form-control" cols="30" rows="10" ${ngClass}></textarea>`,
      select: [
        `<select ${formControlName}="${index}" [id]="${FormEnum.FIELD_ID}" class="form-control" ${ngClass}>`,
          `<option *ngFor="let data of (${async}$ | async)" [ngValue]="data">`,
          `{{ data | json }}`,
          `</option>`,
        `</select>`
      ].join('\n'),
      radio: [
        `<div *ngIf="(${async}$ | async) as asyncData">`,
          `<div *ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(dotNotation.join("."))} = index;">`,
            `<div class="form-check">`,
              `<input type="radio" formControlName="{{ ${index} }}" [value]="data" ${ngClass}>{{ data | json }}`,
            `</div>`,
          `</div>`,
        `</div>`
      ].join('\n'),
      checkbox: [
        `<div *ngIf="(${async}$ | async) as asyncData">`,
          `<div`,
            `*ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(dotNotation.join("."))} = index;"`,
          `>`,
            `<div class="form-check">`,
              `<input`,
                `type="checkbox" `,
                `class="form-check-input"`,
                `${ngClass}`,
                // `[formControl]="data"`,
              `> {{ asyncData[index${ValidatorRuleHelper.camelCasedString(dotNotation.join("."))}] | json }}`,
            `</div>`,
          `</div>`,
        `</div>`
      ].join('\n')
    };
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
    isValueAnObject: boolean,
    completeKeyName: string
  ): [string[], string[]] {
    const formArrayOpenTag: string[] = []
    const formArrayCloseTag: string[] = [];
    const varName = ValidatorRuleHelper.camelCasedString(completeKeyName, true);

    functionDefinition.get.forEach((item: Map<string, string>, i: number) => {
      const formArrayName: string = i <= 0
        ? `[formArrayName]="'${firstKeyNameBeforeDot}'"`
        : `[formArrayName]="${item.get('second_to_last_index')}"`;

      formArrayOpenTag.push(
        `<fieldset ${formArrayName} class="form-group">
          ${this.generateAddButton(item).join("\n")}
          <div
            *ngFor="let _${varName}${i + 1} of ${item.get('get_with_parameters')}?.controls; let ${item.get('last_index')} = index;"
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