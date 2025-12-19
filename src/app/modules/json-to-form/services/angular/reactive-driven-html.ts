import { camelCasedString, wrapLines } from 'src/app/shared/utils/string.utils';
import { InputTypeEnum } from '../../enums/input-type.enum';
import { FormStructure } from './function-definition';
import { FormContext, ValidatorProcessorBase } from './helper/validator-form-context.helper';
import { VALUE_TYPES } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

enum FormEnum {
  FIELD = 'field',
  ABSCTRACT_CONTROL = `f.get(path)`,
  IS_FIELD_VALID = `f.get(path)?.invalid && f.get(path)?.touched`,
  FIELD_ID = `path`,
}

/* eslint-disable */
export class BootstrapInputTemplateBuilder implements InputTemplateStrategy {
  constructor(
    private readonly item: FormStructure
  ) {}

  private formControlClass: string = 'class="form-control"';
  private ngClass: string = `[class.is-invalid]="${FormEnum.IS_FIELD_VALID}"`;
  private fieldId: string = FormEnum.FIELD_ID;
  private id: string = `[id]="${this.fieldId}"`;
  private formControlNameAttr: string = '[formControlName]';

  private get index(): string {
    return `${this.item.index}`;
  }

  private get asyncVar(): string {
    return `${this.item.methodName}$`;
  }

  private get indexName(): string {
    return `index${camelCasedString(this.item.fullKeyPath.join("."))}`;
  }

  private html(...lines: string[]): string {
    return lines.join('\n');
  }

  input(type: string): string {
    return `<input type="${type}" ${this.formControlClass} ${this.id} ${this.ngClass} ${this.formControlNameAttr}="${this.index}">`;
  }

  textarea(): string {
    return `<textarea ${this.formControlClass} ${this.id} ${this.ngClass} ${this.formControlNameAttr}="${this.index}" cols="30" rows="10"></textarea>`;
  }

  select(): string {
    return this.html(
      `<select ${this.formControlNameAttr}="${this.index}" ${this.id} ${this.formControlClass} ${this.ngClass}>`,
        `<option *ngFor="let option of (${this.asyncVar} | async)" [ngValue]="option">`,
          `{{ option | json }}`,
        `</option>`,
      `</select>`
    );
  }

  radio(): string {
    return this.html(
      `<div *ngFor="let option of (${this.asyncVar} | async); let ${this.indexName} = index" class="form-check">`,
        `<input type="radio" class="form-check-input" ${this.ngClass} [value]="option" formControlName="{{ ${this.index} }}">`,
        `<label class="form-check-label">{{ option | json }}</label>`,
      `</div>`
    );
  }

  checkbox(): string {
    return this.html(
      `<div *ngFor="let option of (${this.asyncVar} | async); let ${this.indexName} = index" class="form-check">`,
        `<input type="checkbox" class="form-check-input" ${this.ngClass}>`,
        `<label class="form-check-label">{{ option }}</label>`,
      `</div>`
    );
  }
}

/* eslint-disable */
export class PlainInputTemplateBuilder implements InputTemplateStrategy {
  constructor(
    private readonly item: FormStructure
  ) {}

  private id: string = '';
  private ngClass: string = '';
  private formControlClass: string = '';
  private fieldId: string = FormEnum.FIELD_ID;
  private formControlNameAttr: string = '[formControlName]';

  private get index(): string {
    return `${this.item.index}`;
  }

  private get asyncVar(): string {
    return `${this.item.methodName}$`;
  }
  private get indexName(): string {
    return `index${camelCasedString(this.item.fullKeyPath.join("."))}`;
  }

  private html(...lines: string[]): string {
    return lines.join('\n');
  }

  input(type: string): string {
    return `<input type="${type}" ${this.formControlNameAttr}="${this.index}" ${this.id} ${this.formControlClass} ${this.ngClass}>`;
  }

  textarea(): string {
    return `<textarea ${this.formControlNameAttr}="${this.index}" ${this.id} ${this.formControlClass} cols="30" rows="10" ${this.ngClass}></textarea>`;
  }

  select(): string {
    return this.html(
      `<select ${this.formControlNameAttr}="${this.index}" ${this.id} ${this.formControlClass} ${this.ngClass}>`,
        `<option *ngFor="let option of (${this.asyncVar} | async)" [ngValue]="option">`,
          `{{ option | json }}`,
        `</option>`,
      `</select>`
    );
  }

  radio(): string {
    return this.html(
      `<ng-container *ngIf="(${this.asyncVar} | async) as options">`,
        `<div *ngFor="let option of options; let ${this.indexName} = index;">`,
          `<div class="form-check">`,
            `<input type="radio" formControlName="{{ ${this.index} }}" [value]="option" ${this.ngClass}>{{ option | json }}`,
          `</div>`,
        `</div>`,
      `</ng-container>`
    );
  }

  checkbox(): string {
    return this.html(
      `<ng-container *ngIf="(${this.asyncVar} | async) as options">`,
        `<div *ngFor="let option of options; let ${this.indexName} = index;">`,
          `<div class="form-check">`,
            `<input type="checkbox" class="form-check-input" ${this.ngClass}> {{ options[${this.indexName}] | json }}`,
          `</div>`,
        `</div>`,
      `</ng-container>`
    );
  }
}

export class FormValidatorGenerator {
  generate(rules: string[], getField: string): string[] {
    return rules.reduce((validators: string[], rule: string) => {
      const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

      validators.push(
        this.getErrorsMessages(getField, ruleName, ruleParameters)
      );

      return validators;
    }, []);
  }

  private getErrorsMessages(getField: string, ruleName: string, ruleParameters: string[]): string {
    const fieldId = `${FormEnum.FIELD_ID}`;
    const errorMessages: { [key: string]: string } = {
      required: `<div *ngIf="${getField}?.hasError('required')">{{ ${fieldId} }} is required</div>`,
      min: `<div *ngIf="${getField}?.hasError('minlength')">{{ ${fieldId} }} min must be ${ruleParameters[0]}</div>`,
      max: `<div *ngIf="${getField}?.hasError('maxlength')">{{ ${fieldId} }} max must be ${ruleParameters[0]}</div>`,
      email: `<div *ngIf="${getField}?.hasError('email')">{{ ${fieldId} }} an valid Email</div>`
    };

    return errorMessages[ruleName] || '';
  }
}

/* eslint-disable */
export class FormUtils {
  generateLoopWrapper(item: FormStructure): [string[], string[]] {
    const index = item.lastIndexParam;

    return [
      [
        [
          `<div`,
            `*ngFor="let ${item.attributeName}Ctrl of ${item.getter.call}?.controls;`,
            `let ${index} = index;"`,
          `>`
        ].join(" "),
      ],
      [
        '</div>'
      ]
    ];
  }

  /* eslint-disable */
  public generateDeleteButton(previousFormStructure: FormStructure | undefined, currentFormStructure: FormStructure | undefined): string[] {
    const get = previousFormStructure?.getter.call;
    const index = previousFormStructure?.lastIndexParam;

    return [
      currentFormStructure?.currentValueType === VALUE_TYPES.OBJECT 
        ? `<div class="d-flex justify-content-end mb-2">`
        : ``,
        `<button`,
          `type="button"`,
          `(click)="${get}.removeAt(${index})"`,
          `class="btn btn-danger btn-sm"`,
        `>`,
          `<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>`,
          `&times; Delete`,
        `</button>`,
        currentFormStructure?.currentValueType === VALUE_TYPES.OBJECT 
          ? `</div>`
          : ``,
    ];
  }

  /* eslint-disable */
  public generateAddButton(
    previousFormStructure: FormStructure | undefined,
    currentFormStructure: FormStructure
  ): string[] {
    const get = previousFormStructure?.getter.call;
    const create = currentFormStructure.creator.call;

    return [
      `<button`,
        `type="button" `,
        `class="btn btn-primary btn-block btn-sm" `,
        `(click)="${get}.push(${create})"`,
      `>`,
        `<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>`,
        `ADD`,
      `</button>`,
    ];
  }
}

export enum FrameworkType {
  BOOTSTRAP = 'bootstrap',
  DEFAULT = 'default',
}

export interface InputTemplateStrategy {
  input(type: InputTypeEnum): string;
  textarea(): string;
  select(): string;
  radio(): string;
  checkbox(): string;
}

export class InputTemplateDispatcher {
  constructor(private readonly strategy: InputTemplateStrategy) {}

  resolve(type: string): string {
    switch (type) {
      case InputTypeEnum.TEXTAREA:
        return this.strategy.textarea();
      case InputTypeEnum.SELECT:
        return this.strategy.select();
      case InputTypeEnum.RADIO:
        return this.strategy.radio();
      case InputTypeEnum.CHECKBOX:
        return this.strategy.checkbox();
      default:
        return this.strategy.input(type as InputTypeEnum);
    }
  }
}

export class BootstrapFormWrapperBuilder {
  constructor(
    private readonly item: FormStructure,
    private readonly inputHtml: string,
    private readonly validationHtml: string,
    private readonly deleleButton?: string
  ) {}

  build(): string {
    const pathExpression = `[${this.item.path.join(', ')}] as path`;
    
    /* eslint-disable */
    return [
      `<ng-container *ngIf="${pathExpression}">`,
        `<div class="form-group">`,
          `<label [for]="path" class="form-label">{{ path }}</label>`,
          `<div class="input-group">`,
            this.inputHtml,
            this.deleleButton,
            `<div *ngIf="f.get(path)?.invalid && f.get(path)?.touched" class="invalid-feedback">`,
              this.validationHtml,
            `</div>`,
          `</div>`,
        `</div>`,
      `</ng-container>`
    ]
    .filter(Boolean)
    .join('\n');
  }
}

export class PlainFormWrapperBuilder {
  constructor(
    private readonly item: FormStructure,
    private readonly inputHtml: string,
    private readonly validationHtml: string
  ) {}

  build(): string {
    const pathExpression = `[${this.item.path.join(', ')}] as path`;

    return [this.inputHtml].join("\n");
    /* eslint-disable */
    return [
      `<ng-container *ngIf="${pathExpression}">`,
        `<div>`,
          `<label [for]="path">{{ path }}</label>`,
          this.inputHtml,
          `<div *ngIf="f.get(path)?.invalid && f.get(path)?.touched" class="validation-message">`,
            this.validationHtml,
          `</div>`,
        `</div>`,
      `</ng-container>`
    ].join('\n');
  }
}

export interface FormWrapperBuilder {
  build(): string;
}

export class FormInputGenerator {
  constructor(
    private readonly framework: FrameworkType,
    private readonly formContext: any,
    private readonly rules: string[]
  ) { }

  public get currentFormStructure(): FormStructure {
    return this.formContext.current;
  }

  public get previousFormStructure(): FormStructure {
    return this.formContext.previous;
  }

  generate(): string {
    const { builder, wrapper } = this.getDependenciesForFramework();

    const dispatcher = new InputTemplateDispatcher(builder);
    const inputType = this.getInputTypeFromRules(this.rules);
    const inputHtml = dispatcher.resolve(inputType);
    const validationHtml = new FormValidatorGenerator().generate(this.rules, `${FormEnum.ABSCTRACT_CONTROL}`).join('');

    return wrapper(inputHtml, validationHtml).build();
  }

  public getInputTypeFromRules(rules: string[]): InputTypeEnum {
    const htmlRule = rules
      .map(rule => ValidatorRuleHelper.parseStringRule(rule))
      .find(([name]) => name === 'html');

    if (htmlRule) {
      const [, [type]] = htmlRule;
      return this.typeExists(type);
    }

    return InputTypeEnum.TEXT;
  }

  private typeExists(type: InputTypeEnum): InputTypeEnum {
    return Object.values(InputTypeEnum).find(r => r === type) || InputTypeEnum.TEXT;
  }

  private getDependenciesForFramework(): {
    builder: InputTemplateStrategy;
    wrapper: (inputHtml: string, validationHtml: string) => FormWrapperBuilder;
  } {
    switch (this.framework) {
      case FrameworkType.BOOTSTRAP:
        return {
          builder: new BootstrapInputTemplateBuilder(this.currentFormStructure),
          wrapper: (inputHtml, validationHtml) => new BootstrapFormWrapperBuilder(
            this.currentFormStructure,
            inputHtml, 
            validationHtml,
            this.currentFormStructure.previousValueType === 'array' 
              ? new FormUtils().generateDeleteButton(this.previousFormStructure, this.currentFormStructure).join("\n")
              : ''
          )
        };
      default:
        return {
          builder: new PlainInputTemplateBuilder(this.currentFormStructure),
          wrapper: (inputHtml, validationHtml) => new PlainFormWrapperBuilder(this.currentFormStructure, inputHtml, validationHtml)
        };
    }
  }
}

export class ReactiveDrivenHtml extends ValidatorProcessorBase {
  private rules!: any;
  private triggerValidationOnSubmit: boolean = true;
  private formName: string = 'form';
  private options = {
    showAddButton: true,
    showDeleteButton: true,
    framework: FrameworkType.DEFAULT,
  };

  constructor(rules: Rules, options?: object) {
    super();
    this.options = {
      ...this.options,
      ...(options || {}),
    };
    this.setRules(rules);
  }

  public setFormName(formName: string): void {
    this.formName = formName;
  }

  public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
    this.triggerValidationOnSubmit = triggerValidationOnSubmit;
  }

  /* eslint-disable */
  public generate(): string[] {
    return [
      `<form [formGroup]="${this.formName}" (ngSubmit)="onSubmit()">`,
        `<pre>{{ ${this.formName}.value | json }}</pre>`,
        ...this.process(this.rules),
        `<button type="submit" class="btn btn-primary">`,
        `Submit`,
        `</button>`,
      `</form>`,
    ];
  }

  public handleContext(context: FormContext): string {
    const { key, value, currentValueType, previousValueType, fullKeyPath, currentFormStructure, formStructureStack } = context;
    const previousFormStructure = formStructureStack[formStructureStack.length - 1];
    const formContext = {
      current: currentFormStructure,
      previous: previousFormStructure,
    };

    const formUtils = new FormUtils();

    const [openLoopTag, closeLoopTag] =
      previousValueType === VALUE_TYPES.ARRAY
        ? formUtils.generateLoopWrapper(formContext.previous!)
        : [[], []];

    const addButton = this.options.showAddButton
      ? formUtils.generateAddButton(formContext.previous, formContext.current)
      : [];

    const deleteButton = this.options.showDeleteButton
      ? formUtils.generateDeleteButton(formContext.previous, formContext.current)
      : [];

    const buildWrapperTags = (): string[][] => {
      const customCssClass =
        this.options.framework === FrameworkType.BOOTSTRAP
          ? 'class="p-1 my-1 border border-dark"'
          : '';

      const formIndex =
        previousValueType === VALUE_TYPES.ARRAY
          ? formContext.previous?.lastIndexParam
          : `'${key}'`;

      if (currentValueType === VALUE_TYPES.ARRAY) {
        return [
          [`<fieldset [formArrayName]="${formIndex}" ${customCssClass}>`],
          [`</fieldset>`],
        ];
      }

      if (currentValueType === VALUE_TYPES.OBJECT) {
        const customClass =
          previousValueType === VALUE_TYPES.ARRAY &&
          this.options.framework === FrameworkType.BOOTSTRAP
            ? 'class="p-1 mb-2"'
            : '';

        return [[`<div [formGroupName]="${formIndex}" ${customClass}>`], [`</div>`]];
      }

      return [];
    };

    const nextStack = [...formStructureStack, currentFormStructure];

    if (currentValueType === VALUE_TYPES.ARRAY) {
      const [open, close] = buildWrapperTags();
      const innerHtml = this.process(
        value,
        fullKeyPath,
        currentValueType,
        nextStack,
      );

      return previousValueType === VALUE_TYPES.ARRAY
        ? wrapLines([
            ...openLoopTag,
            // '<div class="d-flex mb-2">',
            ...addButton,
            ...deleteButton,
            // '</div>',
            ...open,
            ...innerHtml,
            ...close,
            ...closeLoopTag,
          ])
        : wrapLines([...open, ...innerHtml, ...close]);
    }

    if (currentValueType === VALUE_TYPES.OBJECT) {
      const [open, close] = buildWrapperTags();
      const innerHtml = this.process(
        value,
        fullKeyPath,
        currentValueType,
        nextStack,
      );

      return previousValueType === VALUE_TYPES.ARRAY
        ? wrapLines([
            ...addButton,
            ...openLoopTag,
            ...open,
            ...deleteButton,
            ...innerHtml,
            ...close,
            ...closeLoopTag,
          ])
        : wrapLines([...open, ...innerHtml, ...close]);
    }

    if (currentValueType === VALUE_TYPES.STRING) {
      const rules = this.extractRules(value);
      const stringInput = new FormInputGenerator(
        this.options.framework,
        formContext,
        rules,
      ).generate();

      return previousValueType === VALUE_TYPES.ARRAY
        ? wrapLines([...addButton, ...openLoopTag, stringInput, ...closeLoopTag])
        : stringInput;
    }

    return '';
  }

  private extractRules(value: string): string[] {
    return value.split('|');
  }

  private setRules(rules: Rules): void {
    this.rules = rules;
  }
}
