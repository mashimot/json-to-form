import { InputTypeEnum } from '../../enums/input-type.enum';
import { FormArrayBuilder } from './function-definition';
import { Definition } from './models/Definition';
import { ValueType } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

enum FormEnum {
  FIELD = 'field',
  ABSCTRACT_CONTROL = `field.abstractControl`,
  IS_FIELD_VALID = `field.isFieldValid`,
  IS_FIELD_VALID2 = `isFieldInvalid(field)`,
  FIELD_ID = `field.id`,
}

export class ReactiveDrivenHtml {
  rules!: any;
  triggerValidationOnSubmit: boolean = true;
  formName: string = 'form';
  private index: number = 0;
  private formControlName: string = '[formControlName]';

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
    namesArr: string[] = [],
    previousValueType: ValueType = 'object'
  ): string {
    const reactiveDrivenHtml = Object.keys(object)
      .map((key: string, index: number) => {
        const value = ValidatorRuleHelper.changeValue(object[key]);
        const currentValueType = ValidatorRuleHelper.getType(value);
        const remainingKeys = ValidatorRuleHelper.createRemainingKeys(namesArr, previousValueType, key, currentValueType);
        const completeKeyNameSplitDot = [...namesArr, ...remainingKeys];
        const isLastIndexFromValueArray = this.index - 1 === index ? true : false;
        let formArrayBuilder: Definition = {
          get: [],
          formBuilder: []
        };
     
        if (currentValueType !== 'array') {
          if (previousValueType === 'array' && this.index - 1 !== index) {
            return '';
          }

          formArrayBuilder = new FormArrayBuilder(
            completeKeyNameSplitDot,
            [],
            currentValueType,
            previousValueType
          )
            .get();
        }

        if (currentValueType === 'array') {
          this.index = value.length;

          return this.reactiveDrivenHtml(value, completeKeyNameSplitDot, 'array');
        }

        //ex: { keyName: {} }
        if (currentValueType === 'object') {
          if (previousValueType === 'array') {
            if (isLastIndexFromValueArray === false) {
              return '';
            }

            const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArrayWrapper(
              formArrayBuilder, currentValueType
            );
            const FORM_ARRAY: string[] = [
              formArrayOpenTag.join("\n"),
              this.reactiveDrivenHtml(value, completeKeyNameSplitDot, 'object'),
              formArrayCloseTag.join("\n"),
            ];

            return FORM_ARRAY.join("\n");
          }

          return [
            `<div [formGroupName]="'${key}'">`,
            `${this.reactiveDrivenHtml(value, completeKeyNameSplitDot, 'object')}`,
            `</div>`
          ]
            .join('\n');
        }

        //ex: { keyName: [] }
        if (currentValueType === 'string') {
          const rules = value.split("|");
          const index = this.getIndex(previousValueType, formArrayBuilder?.get || []);
          const INPUTS = this.generateFormInput2(
            index,
            completeKeyNameSplitDot
          );
          const formInput = this.generateFormInput(INPUTS, rules);
          const formValidators = this.generateFormValidators(rules, `${FormEnum.ABSCTRACT_CONTROL}`);
          const lastItem = formArrayBuilder.get?.[formArrayBuilder.get.length - 1];

          let formArrayOpenWrapper: string[] = [];
          let formArrayCloseWrapper: string[] = [];

          //ex.*: { keyName: [] }
          if (formArrayBuilder.get.length > 0) {
            [formArrayOpenWrapper, formArrayCloseWrapper] = this.generateFormArrayWrapper(
              formArrayBuilder, currentValueType
            );
          }
          
          return [
            formArrayOpenWrapper.join(""),
            this.formWrapper(formInput, formValidators, lastItem),
            formArrayCloseWrapper.join("")
          ]
            .filter(el => el)
            .join("\n");
        }

        return '';
      })
      .filter(el => el)
      .join("\n");

    return reactiveDrivenHtml;
  }

  protected formWrapper(formInput: string, formValidators: string[], item: Map<string, string>): string {
    return [
      // this.ifOpenWrapper(`getField(${'getField'}) as field`),
      `<div class="form-group" *ngIf="getField([${item?.get('full_path')}]) as field">`,
          `<label [for]="${FormEnum.FIELD_ID}">{{ ${FormEnum.FIELD_ID} }}</label>`,
          `${formInput}`,
          `<div *ngIf="${FormEnum.IS_FIELD_VALID}" class="invalid-feedback">`,
          `${formValidators.join("")}`,
          `</div>`,
        `</div>`,
      // this.ifCloseWrapper()
    ]
      .filter(el => el)
      .join("\n")
  }

  private generateFormInput(INPUTS: { [key: string]: string }, rules: string[]): string {
    return rules.reduce((form: string, rule: string) => {
      const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

      if (ruleName === 'html') {
        form = INPUTS[ruleParameters[0]] || INPUTS.text;
      }

      return form;
    }, INPUTS.text);
  }

  private generateFormValidators(rules: string[], getField: string): string[] {
    return rules.reduce((validators: string[], rule: string) => {
      const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

      validators.push(
        this.getErrorsMessages(getField, ruleName, ruleParameters)
      );

      return validators;
    }, []);
  }

  private getIndex(previousValueType: string, nestedFormArray: Array<Map<string, string>>): string {
    if (nestedFormArray.length > 0) {
      const lastFormArray = nestedFormArray?.[nestedFormArray.length - 1];
      if (previousValueType === 'array') {
        return `${lastFormArray.get('second_to_last_index')}`;
      }

      return `'${lastFormArray.get('first_key_before_dot')}'`;
    }

    return '';
  }

  protected getErrorsMessages(getField: string, ruleName: string, ruleParameters: string[]): string {
    const fieldId = `${FormEnum.FIELD_ID}.toUpperCase()`;
    const errorMessages: { [key: string]: string } = {
      required: `<div *ngIf="${getField}!.hasError('required')">{{ ${fieldId} }} is required</div>`,
      min: `<div *ngIf="${getField}!.hasError('minlength')">{{ ${fieldId} }} min must be ${ruleParameters[0]}</div>`,
      max: `<div *ngIf="${getField}!.hasError('maxlength')">{{ ${fieldId} }} max must be ${ruleParameters[0]}</div>`,
      email: `<div *ngIf="${getField}!.hasError('email')">{{ ${fieldId} }} an valid Email</div>`
    };

    return errorMessages[ruleName] || '';
  }

  public ifOpenWrapper(condition: string): string {
    return `<ng-container *ngIf="${condition}">`;
    return `@if(${condition}) {`;
  }

  public ifCloseWrapper(): string {
    return `</ng-container>`;
    return '}';
  }

  private setRules(rules: Rules): void {
    this.rules = rules;
  }

  private generateFormInput2(
    index: string,
    completeKeyNameSplitDot: string[]
  ): {
    [key: string]: string
  } {
    const formControlName = this.formControlName;
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

  protected generateDeleteButton(item: Map<string, string>): string[] {
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

  protected generateAddButton(item: Map<string, string>): string[] {
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

  private generateFormArrayWrapper(
    formArrayBuilder: Definition,
    currentValueType: ValueType
  ): [string[], string[]] {
    const formArrayOpenTag: string[] = []
    const formArrayCloseTag: string[] = [];
    const formArrays = [...formArrayBuilder.get.slice(0, -1)];

    formArrays.forEach((item: Map<string, string>, i: number) => {
        const formArrayName: string = i <= 0
          ? `[formArrayName]="'${item.get('first_key_before_dot')}'"`
          : `[formArrayName]="${item.get('second_to_last_index')}"`;

        formArrayOpenTag.push(
          `<fieldset ${formArrayName} class="form-group">
            ${this.generateAddButton(item).join("\n")}
            <div
              *ngFor="let _${item.get('attribute_name')} of ${item.get('get_function_name')}${item.get('parameters')}?.controls; let ${item.get('last_index')} = index;"
              ${
                currentValueType === 'object' && i === formArrays.length - 1
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