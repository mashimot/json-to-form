import { InputTypeEnum } from '../../enums/input-type.enum';
import { ReservedWordEnum } from '../../enums/reserved-name.enum';
import { FunctionDefinition } from './function-definition';
import { Definition } from './models/Definition';
import { ValueType } from './models/value.type.';
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
  private index: number = 0;

  constructor(rules: Rules) {
    this.setRules(rules);
  }

  public setFormName(formName: string): void {
    this.formName = formName;
  }

  public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
    this.triggerValidationOnSubmit = triggerValidationOnSubmit;
  }

  public generate(): string[] {
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
    namesArr: (any)[] = [],
    nestedFormArray: Array<Map<string, string>> = [],
    previousValueType: string = 'object'
  ): string {
    const reactiveDrivenHtml = Object.keys(object)
      .map((key: string, index: number) => {
        const value = ValidatorRuleHelper.changeValue(object[key]);
        const valueType = ValidatorRuleHelper.getType(value);
        const isValueString = valueType === 'string';
        const isValueAnArray = valueType === 'array';
        const isValueAnObject = valueType === 'object';
        const restArr = [];
        if(namesArr.length <= 0 || previousValueType !== 'array') {
            restArr.push(key);
        }
        if (isValueAnArray) {
          this.index = value.length;
          restArr.push(true);
        }
        const completeKeyName = [ ...namesArr, ...restArr ];
        const completeKeyNameSplitDot = completeKeyName.map(keyName => {
            return keyName === true ? ReservedWordEnum.__ARRAY__ : keyName;
        })
        const dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyNameSplitDot);
        const nameSplitDot = namesArr;
        const isLastIndexFromValueArray = this.index - 1 === index ? true : false;
        let functionDefinition: Definition = {
          get: [],
          formBuilder: []
        };

        if (!isValueAnArray && previousValueType === 'array') {
          if(isLastIndexFromValueArray === false) {
            return '';
          }

          functionDefinition = new FunctionDefinition(completeKeyNameSplitDot).get();
          if (functionDefinition.get.length > 0) {
            nestedFormArray.push(functionDefinition.get[functionDefinition.get.length - 1]);
          }
        }

        if (isValueAnArray) {
          return this.reactiveDrivenHtml(value, completeKeyName, nestedFormArray, 'array');
        }

        //ex: { keyName: {} }
        if (isValueAnObject) {
          if (previousValueType === 'array') {
            if(isLastIndexFromValueArray === false) {
              return '';
            }

            const ass = ValidatorRuleHelper.removeAsteriskFromString(completeKeyNameSplitDot);
            const firstKeyNameBeforeDot = ass[ass.length - 1];
            const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
              functionDefinition, firstKeyNameBeforeDot, isValueAnObject, completeKeyNameSplitDot.join(".")
            );
            const FORM_ARRAY: string[] = [
              formArrayOpenTag.join("\n"),
              this.reactiveDrivenHtml(value, completeKeyName, nestedFormArray, 'object'),
              formArrayCloseTag.join("\n"),
            ];

            nestedFormArray.pop();

            return FORM_ARRAY.join("\n");
          }

          return [
            `<div [formGroupName]="'${key}'">`,
              `${this.reactiveDrivenHtml(value, completeKeyName, nestedFormArray, 'object')}`,
            `</div>`
          ]
            .join('\n');
        }

        //ex: { keyName: [] }
        if (isValueString) {
          const ass = ValidatorRuleHelper.removeAsteriskFromString(completeKeyNameSplitDot);
          const firstKeyNameBeforeDot = ass[ass.length - 1];
          const validateAsString: boolean = true;
          const generateFormControlName = (): string => '[formControlName]';
          const generateGetField = (lastName: string, nestedFormArray: Array<Map<string, string>>, dotNotationSplit: string[]): string => {
            if (validateAsString) {
              return `[${ValidatorRuleHelper.getField(completeKeyNameSplitDot)}]`;
            }

            if (nestedFormArray.length > 0) {
              const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
              return previousValueType === 'array'
                ? `${lastFormArray.get('get_at')}`
                : `${lastFormArray.get('get_at')}.get('${lastName}')`;
            }

            return `f.get('${dotNotationSplit.filter((el: string) => el !== ReservedWordEnum.__ARRAY__).join(".")}')`;
          };
          const generateFormInput = (
            INPUTS: { [key: string]: string },
            rules: string[]
          ) => {
            return rules.reduce((form: string, rule: string) => {
              const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

              if (ruleName === 'html') {
                form = INPUTS[ruleParameters[0]] || INPUTS.text;
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
              if (previousValueType === 'array') {
                return `${lastFormArray.get('last_index')}`;
              }
            }

            return previousValueType === 'array' ? firstKeyNameBeforeDot : `'${firstKeyNameBeforeDot}'`;
          }
          const rules = value.split("|");
          const lastName = previousValueType === 'array' ? nameSplitDot[nameSplitDot.length - 1] : key;
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
          if(functionDefinition.get.length > 0) {
            [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
              functionDefinition, firstKeyNameBeforeDot, isValueAnObject, completeKeyNameSplitDot.join(".")
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
    const fieldId = `${FormEnum.FIELD_ID}.toUpperCase()`;
    const errorMessages: { [key: string]: string } = {
        required: `<div *ngIf="${getField}!.hasError('required')">{{ ${fieldId} }} is required</div>`,
        min: `<div *ngIf="${getField}!.hasError('minlength')">{{ ${fieldId} }} min must be ${ruleParameters[0]}</div>`,
        max: `<div *ngIf="${getField}!.hasError('maxlength')">{{ ${fieldId} }} max must be ${ruleParameters[0]}</div>`,
        email: `<div *ngIf="${getField}!.hasError('email')">{{ ${fieldId} }} an valid Email</div>`
    };

    return errorMessages[ruleName] || '';
  }

  private setRules(rules: Rules): void {
    this.rules = rules;
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
    const input = Object.values(InputTypeEnum).reduce(
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
            ${isValueAnObject === true && i === functionDefinition.get.length - 1
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