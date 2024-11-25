import { InputTypeEnum } from '../../enums/input-type.enum';
import { ReservedWordEnum } from '../../enums/reserved-name.enum';
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
    nestedFormArray: Array<Map<string, string>> = [],
    previousValueType: ValueType = 'object'
  ): string {
    const reactiveDrivenHtml = Object.keys(object)
      .map((key: string, index: number) => {
        const value = ValidatorRuleHelper.changeValue(object[key]);
        const currentValueType = ValidatorRuleHelper.getType(value);
        const remainingKeys = ValidatorRuleHelper.createRemainingKeys(namesArr, previousValueType, key, currentValueType);
        const completeKeyNameSplitDot = [...namesArr, ...remainingKeys];
        const dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyNameSplitDot);
        const isLastIndexFromValueArray = this.index - 1 === index ? true : false;
        const keyNamesWithoutReservedWord = ValidatorRuleHelper.removeReservedWordFromString(completeKeyNameSplitDot);
        const firstKeyNameBeforeDot = keyNamesWithoutReservedWord[keyNamesWithoutReservedWord.length - 1];
        // const formArrayBuilder: Definition = new FormArrayBuilder(completeKeyNameSplitDot, [], currentValueType, previousValueType).get();
        let formArrayBuilder: Definition = {
          get: [],
          formBuilder: []
        };

        if (currentValueType !== 'array') {
          if (previousValueType === 'array') {
              if (this.index - 1 !== index) {
                  return '';
              }
          }
          
          formArrayBuilder = new FormArrayBuilder(
              completeKeyNameSplitDot,
              [],
              currentValueType,
              previousValueType
          )
              .get();

              // formArrayBuilder = new FormArrayBuilder(completeKeyNameSplitDot).get();
          if (formArrayBuilder.get.length > 0) {
            if(previousValueType === 'array' && currentValueType === 'string'){
              nestedFormArray.push(formArrayBuilder.get[formArrayBuilder.get.length - 1]);
            }
          }
        }

        if (currentValueType === 'array') {
          this.index = value.length;

          return this.reactiveDrivenHtml(value, completeKeyNameSplitDot, nestedFormArray, 'array');
        }

        //ex: { keyName: {} }
        if (currentValueType === 'object') {
          if (previousValueType === 'array') {
            if (isLastIndexFromValueArray === false) {
              return '';
            }

            const [formArrayOpenTag, formArrayCloseTag] = this.generateFormArray(
              formArrayBuilder, firstKeyNameBeforeDot, currentValueType
            );
            const FORM_ARRAY: string[] = [
              formArrayOpenTag.join("\n"),
              this.reactiveDrivenHtml(value, completeKeyNameSplitDot, nestedFormArray, 'object'),
              formArrayCloseTag.join("\n"),
            ];

            nestedFormArray.pop();

            return FORM_ARRAY.join("\n");
          }

          return [
            `<div [formGroupName]="'${key}'">`,
            `${this.reactiveDrivenHtml(value, completeKeyNameSplitDot, nestedFormArray, 'object')}`,
            `</div>`
          ]
            .join('\n');
        }

        //ex: { keyName: [] }
        if (currentValueType === 'string') {
          const validateAsString: boolean = true;
          const rules = value.split("|");
          const lastName = previousValueType === 'array' ? namesArr[namesArr.length - 1] : key;
          const index = this.getIndex(firstKeyNameBeforeDot, nestedFormArray, previousValueType);
          const formControlName = this.generateFormControlName();
          const getField = this.generateGetField(lastName, nestedFormArray, dotNotationSplit, validateAsString, completeKeyNameSplitDot, previousValueType);
          const INPUTS = this.generateFormInput2(
            formControlName,
            index,
            completeKeyNameSplitDot
          );
          const formInput = this.generateFormInput(INPUTS, rules);
          const formValidators = this.generateFormValidators(rules, `${FormEnum.ABSCTRACT_CONTROL}`);

          let formArrayOpenWrapper: string[] = [];
          let formArrayCloseWrapper: string[] = [];

          //ex.*: { keyName: [] }
          if (nestedFormArray.length > 0) {
            [formArrayOpenWrapper, formArrayCloseWrapper] = this.generateFormArray(
              formArrayBuilder, firstKeyNameBeforeDot, currentValueType
            );

            nestedFormArray.pop();
          }
          
          // return [
          //   formArrayOpenWrapper.join(""),
          //   this.formWrapper(formInput, formValidators, formArrayBuilder.get[0]), 
          //   formArrayCloseWrapper.join("")
          // ]
          //   .filter(el => el)
          //   .join("\n");
          return [
            formArrayOpenWrapper.join(""),
            `<div class="form-group" *ngIf="getField(${getField}) as field">`,
              `<label [for]="${FormEnum.FIELD_ID}">{{ ${FormEnum.FIELD_ID} }}</label>`,
              `${formInput}`,
              `<div *ngIf="${FormEnum.IS_FIELD_VALID}" class="invalid-feedback">`,
                `${formValidators.join("")}`,
              `</div>`,
            `</div>`,
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
        `<div class="form-group">`,
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

  // Métodos separados
  private generateFormControlName(): string {
    return '[formControlName]';
  }

  protected generateGetField(
    lastName: string,
    nestedFormArray: Array<Map<string, string>>,
    dotNotationSplit: string[],
    validateAsString: boolean,
    completeKeyNameSplitDot: any[],
    previousValueType: string
  ): string {
    if (validateAsString) {
      return `[${ValidatorRuleHelper.getPath(completeKeyNameSplitDot)}]`;
    }

    if (nestedFormArray.length > 0) {
      const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
      return previousValueType === 'array'
        ? `${lastFormArray.get('get_at')}`
        : `${lastFormArray.get('get_at')}.get('${lastName}')`;
    }
    
    return ValidatorRuleHelper.camelCasedString(
      dotNotationSplit
          .filter((el: string) => el !== ReservedWordEnum.__ARRAY__)
          .join(""),
      true
    );

    // return `f.get('${dotNotationSplit.filter((el: string) => el !== ReservedWordEnum.__ARRAY__).join(".")}')`;
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
        this.getErrorsMessages({ ruleName, ruleParameters, getField })
      );

      return validators;
    }, []);
  }

  private getIndex(firstKeyNameBeforeDot: string, nestedFormArray: Array<Map<string, string>>, previousValueType: string): string {
    if (nestedFormArray.length > 0) {
      const lastFormArray = nestedFormArray[nestedFormArray.length - 1];
      if (previousValueType === 'array') {
        return `${lastFormArray.get('second_to_last_index')}`;
      }
    }

    return previousValueType === 'array' ? firstKeyNameBeforeDot : `'${firstKeyNameBeforeDot}'`;
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

  private generateFormArray(
    formArrayBuilder: Definition,
    firstKeyNameBeforeDot: string,
    currentValueType: ValueType
  ): [string[], string[]] {
    const formArrayOpenTag: string[] = []
    const formArrayCloseTag: string[] = [];
    const bundas = [...formArrayBuilder.get.slice(0, -1)];

    bundas.forEach((item: Map<string, string>, i: number) => {
        const formArrayName: string = i <= 0
          ? `[formArrayName]="'${firstKeyNameBeforeDot}'"`
          : `[formArrayName]="${item.get('second_to_last_index')}"`;

        formArrayOpenTag.push(
          `<fieldset ${formArrayName} class="form-group">
            ${this.generateAddButton(item).join("\n")}
            <div
              *ngFor="let _${item.get('attribute_name')} of ${item.get('get_function_name')}${item.get('parameters')}?.controls; let ${item.get('last_index')} = index;"
              ${
                currentValueType === 'object' && i === bundas.length - 1
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