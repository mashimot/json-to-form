import { camelCasedString, wrapLines } from '@shared/utils/string.utils';
import { __ARRAY__, AccessModifier } from '../../enums/reserved-name.enum';
import { FormStructure } from './function-definition';
import { FormContext, ValidatorProcessorBase } from './helper/validator-form-context.helper';
import { VALUE_TYPES, ValueType } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

interface Options {
  formName: string;
  triggerValidationOnSubmit?: boolean;
  container?: 'container' | 'container-fluid';
  componentName: string;
  formBuildMode: FormOutputFormat;
}

export class Validator {
  private rules: string[];

  public constructor(rules: string[]) {
    this.rules = rules;
  }

  public get(): string[] {
    return this.rules
      .reduce((acc: string[], rule: string) => {
        acc.push(this.validate('', rule));

        return acc;
      }, [])
      .filter((el) => el);
  }

  //$attribute, $value, $parameters, $this
  public validate(attribute: string, rule: string): string {
    const [newRule, parameters] = ValidatorRuleHelper.parseStringRule(rule); //{rule}:{parameters}
    //$value = $this->getValue($attribute);

    if (newRule === 'min') {
      return this.validateMin(parameters);
    }
    if (newRule === 'max') {
      return this.validateMax(parameters);
    }
    if (newRule === 'required') {
      return this.validateRequired();
    }
    if (newRule === 'email') {
      return this.validateEmail();
    }
    if (newRule === 'between_length') {
      return this.validateBetweenLength(parameters);
    }

    return '';
  }

  public validateBetweenLength(parameters: string[]): string {
    return `ArrayValidators.betweenLength(${parameters[0]})`;
  }

  public validateMax(parameters: string[]): string {
    return `Validators.maxLength(${parameters[0]})`;
  }

  public validateEmail(): string {
    return `Validators.email`;
  }

  public validateMin(parameters: string[]): string {
    return `Validators.minLength(${parameters[0]})`;
  }

  public validateRequired(): string {
    return `Validators.required`;
  }
}

export class BuildPathForm extends ValidatorProcessorBase {
  public constructor(private rules: any) {
    super();
  }

  public get(): string[] {
    return this.process(this.rules);
  }

  handleContext(context: FormContext): string {
    const { value, currentValueType, fullKeyPath, currentFormStructure, formStructureStack } =
      context;

    const previousFormStructure = formStructureStack[formStructureStack.length - 1];
    const formContext = {
      current: currentFormStructure,
      previous: previousFormStructure,
    };

    if (
      currentValueType === VALUE_TYPES.ARRAY ||
      currentValueType === VALUE_TYPES.OBJECT ||
      currentValueType === VALUE_TYPES.STRING
    ) {
      const [openForEach, closeForEach] = this.forEachWrapper(
        formContext.previous!,
        formContext.current,
      );
      const nextStack = [...formStructureStack, currentFormStructure];
      const innerForEachBlock =
        currentValueType === VALUE_TYPES.STRING
          ? ''
          : this.process(value, fullKeyPath, currentValueType, nextStack);

      return wrapLines([...openForEach, ...innerForEachBlock, ...closeForEach].filter(Boolean));
    }

    return '';
  }

  private forEachWrapper(previous: FormStructure, current: FormStructure): [string[], string[]] {
    if (current.previousValueType !== VALUE_TYPES.ARRAY) {
      return [[], []];
    }

    const buildKeyPath = (previous: FormStructure): string => {
      const cleanedPath = (previous.path || []).map((p) => p.replace(/^'|'$/g, ''));
      const lastArrayIndex = previous.pathSegments.lastIndexOf(__ARRAY__);
      const rootKey =
        lastArrayIndex === -1 ? `${AccessModifier.this}.data` : `item${previous.paramCounter - 1}`;
      const suffixPath = cleanedPath.slice(lastArrayIndex + 1);

      return [rootKey, ...suffixPath].join('.');
    };

    const keyPath = buildKeyPath(previous);
    const paramName = `item${previous.paramCounter}`;
    const indexParam = previous.lastIndexParam;
    const getterCall = `${AccessModifier.this}.${previous.getter?.call}`;
    const creatorCall = `${AccessModifier.this}.${current.creator.call}`;
    const openBlock = [
      `// @ts-ignore`,
      `${keyPath}.forEach((${paramName}, ${indexParam}) => {`,
      `${getterCall}.push(${creatorCall})`,
    ];

    const closeBlock = [`});`];

    return [openBlock, closeBlock];
  }
}

export enum FormOutputFormat {
  Json = 'JSON',
  AngularFormBuilder = 'ANGULAR_FORM_BUILDER',
  AngularRawInstance = 'ANGULAR_RAW_INSTANCE',
}

export const FORM_OUTPUT_WRAPPERS: any = {
  [FormOutputFormat.Json]: {
    [VALUE_TYPES.ARRAY]: { OPEN: '[', CLOSE: ']' },
    [VALUE_TYPES.OBJECT]: { OPEN: '{', CLOSE: '}' },
    [VALUE_TYPES.STRING]: { OPEN: '"', CLOSE: '"' },
  },
  [FormOutputFormat.AngularFormBuilder]: {
    [VALUE_TYPES.ARRAY]: { OPEN: `${AccessModifier.this}.formBuilder.array([`, CLOSE: '])' },
    [VALUE_TYPES.OBJECT]: { OPEN: `${AccessModifier.this}.formBuilder.group({`, CLOSE: '})' },
    [VALUE_TYPES.STRING]: { OPEN: `${AccessModifier.this}.formBuilder.control(`, CLOSE: ')' },
  },
  [FormOutputFormat.AngularRawInstance]: {
    [VALUE_TYPES.ARRAY]: { OPEN: 'new FormArray([', CLOSE: '])' },
    [VALUE_TYPES.OBJECT]: { OPEN: 'new FormGroup({', CLOSE: '})' },
    [VALUE_TYPES.STRING]: { OPEN: 'new FormControl(', CLOSE: ')' },
  },
} as const;

export class ReactiveDrivenValidator extends ValidatorProcessorBase {
  private rules!: any;
  private _options: Options = {
    formName: 'form',
    triggerValidationOnSubmit: true,
    componentName: '',
    container: 'container',
    formBuildMode: FormOutputFormat.AngularFormBuilder,
  };
  private optionChoices: string[] = [];

  constructor(
    rules: any,
    private componentName: string,
    private options?: any,
  ) {
    super();
    this.setOptions(options);
    this.setRules(rules);
  }

  private setOptions(options: any): void {
    this.options = {
      ...this.options,
      formBuildMode: options?.formBuildMode
        ? options?.formBuildMode
        : FormOutputFormat.AngularFormBuilder,
    };
  }

  public generateFormBuilder(): string[] {
    const { OPEN, CLOSE } = this.getFormWrapper(VALUE_TYPES.OBJECT);

    return [
      `${AccessModifier.this}.${this._options.formName} = ${OPEN}`,
      ...this.process(this.rules),
      `${CLOSE};`,
    ];
  }

  private imports(): string[] {
    return [
      `import { Component, Input, OnInit } from '@angular/core'`,
      `import { Validators, FormControl, FormGroup, FormBuilder, FormArray, ReactiveFormsModule } from '@angular/forms'`,
      `import { of } from 'rxjs';`,
      `import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';`,
    ];
  }

  /* eslint-disable */
  private componentDecorator(): string[] {
    const asyncPipe = this.observableAttributes().length > 0 ? 'AsyncPipe' : '';
    return [
      `@Component({`,
        `selector: 'app-${this.componentName}',`,
        `templateUrl: './${this.componentName}.component.html',`,
        `styleUrls: ['./${this.componentName}.component.css'],`,
        `standalone: true,`,
        `imports: [`,
          `ReactiveFormsModule,`,
          `NgIf,`,
          `NgFor,`,
          `JsonPipe,`,
          asyncPipe,
        `]`,
      `})`,
    ]
    .filter(el => el);
  }

  private classAttributes(): string[] {
    return [
      `${this._options.formName}!: FormGroup;`,
      `formSubmitAttempt: boolean = false;`,
      `@Input() data: any;`,
      // `@Input() data: any = ${JSON.stringify(this.rules)}`
    ];
  }

  private getConstructor(): string[] {
    return [`constructor(`, `private formBuilder: FormBuilder`, `) {}`];
  }

  /* eslint-disable */
  private getNgOnInit(formGroup: string[]): string[] {
    return [
      `ngOnInit(): void {`, 
        `${AccessModifier.this}.buildForm()`, 
        `${AccessModifier.this}.patchForm()`, 
      `}`,
      this.addNewLine(),
      `buildForm(): void {`, 
        `${wrapLines(formGroup)}`, 
      `}`,
    ];
  }

  private observableAttributes(): string[] {
    return this.optionChoices;
  }

  /* eslint-disable */
  private get getters(): string {
    return wrapLines([
      `get f(): FormGroup {`,
        `return ${AccessModifier.this}.form as FormGroup;`,
      `}`,
      ...Object.keys(this.formContext).map(key => {
        return this.formContext[key]?.getters || '';
      }).filter(el => el)
    ]);
  }

  private get creaters(): string {
    return wrapLines(
      Object.keys(this.formContext).map(key => {
        return this.formContext[key]?.creaters || '';
      }).filter(el => el)
    );
  }

  private addNewLine(): string {
    return '';
  }

  /* eslint-disable */
  private submitMethod(): string[] {
    return [
      `onSubmit(): void {`,
        `${AccessModifier.this}.formSubmitAttempt = true;`,
          `if (${AccessModifier.this}.f.valid) {`,
          `console.log('form submitted');`,
        `}`,
      `}`,
    ];
  }

  /* eslint-disable */
  private patchForm(): string[] {
    return [
      `${AccessModifier.private} patchForm(): void {`,
        ...new BuildPathForm(this.rules).get(),
        `${AccessModifier.this}.f.patchValue(${AccessModifier.this}.data);`,
      `}`,
    ];
  }

  public generateComponent(): string[] {
    const formGroup: string[] = this.generateFormBuilder();
    return [
      ...this.imports(),
      this.addNewLine(),
      ...this.componentDecorator(),
      `export class ${camelCasedString(this.componentName)}Component implements OnInit {`,
      ...this.classAttributes(),
      ...this.observableAttributes(),
      this.addNewLine(),
      ...this.getConstructor(),
      this.addNewLine(),
      ...this.getNgOnInit(formGroup),
      this.addNewLine(),
      ...this.submitMethod(),
      this.addNewLine(),
      this.getters,
      this.addNewLine(),
      this.creaters,
      this.addNewLine(),
      ...this.patchForm(),
      `}`,
    ];
  }

  private getFormWrapper(type: ValueType): { OPEN: string; CLOSE: string } {
    return FORM_OUTPUT_WRAPPERS[this.options.formBuildMode][type];
  }

  handleContext(context: FormContext): string {
    const { value, currentValueType, fullKeyPath, key, previousValueType, nameDotNotation, currentFormStructure } = context;
    const formStructureTemplate = this.buildFormWrapper(
      key,
      value,
      currentValueType,
      previousValueType,
      fullKeyPath,
    );

    const registerFormFieldHandlers = () => {
      this.formContext[nameDotNotation] = {
        getters: currentFormStructure.getter.withReturn
      };

      const isArrayType = 
        previousValueType === VALUE_TYPES.ARRAY || 
        currentValueType === VALUE_TYPES.ARRAY;

      if (isArrayType) {
        this.formContext[nameDotNotation] = {
          ...this.formContext[nameDotNotation],
          creaters: currentFormStructure.creator.withReturn(formStructureTemplate)
        };
      }
    };

    registerFormFieldHandlers();

    //value: can be an array ['required', 'min:40'] or either an object {}
    if (currentValueType === VALUE_TYPES.ARRAY) {
      return wrapLines([
        previousValueType === VALUE_TYPES.ARRAY ? '' : `"${key}":`,
        `${AccessModifier.this}.${currentFormStructure.creator.call},`,
      ]);
    }

    if (previousValueType === VALUE_TYPES.ARRAY && currentValueType === VALUE_TYPES.OBJECT) {
      return `${AccessModifier.this}.${currentFormStructure.creator.call}`;
    }

    if (currentValueType === VALUE_TYPES.OBJECT) {
      return wrapLines([...formStructureTemplate, ',']);
    }

    if (currentValueType === VALUE_TYPES.STRING) {
      const rules = value.split('|');
      const optionChoices = this.generateValues(rules);
      if (optionChoices.length > 0) {
        this.optionChoices.push(
          `${AccessModifier.public} ${currentFormStructure.methodName}$ = of(${JSON.stringify(optionChoices)})`,
        );
      }

      return previousValueType === VALUE_TYPES.ARRAY
        ? `${AccessModifier.this}.${currentFormStructure.creator.call}`
        : formStructureTemplate.toString();
    }

    return '';
  }

  private buildFormWrapper(
    key: string,
    value: any,
    currentValueType: ValueType,
    previousType: ValueType,
    fullKeyPath: string[],
  ): string[] {
    const { OPEN, CLOSE } = this.getFormWrapper(currentValueType);

    if (currentValueType === VALUE_TYPES.ARRAY) {
      const content = this.process(value, fullKeyPath, VALUE_TYPES.ARRAY);

      return [OPEN, ...content, CLOSE];
    }

    if (currentValueType === VALUE_TYPES.STRING) {
      const rules = this.extractRules(value);
      const ruleParams = new Validator(rules).get();
      const isCheckbox = rules.some((rule: string) => {
        const [ruleName, ruleArgs] = ValidatorRuleHelper.parseStringRule(rule);
        return ruleName === 'html' && ruleArgs?.[0] === 'checkbox';
      });
      const validators = `[${ruleParams.join(',')}]`;
      const formControl = `${OPEN}'' , ${validators}${CLOSE}`;

      return previousType === VALUE_TYPES.ARRAY
        ? [formControl + ';']
        : [`"${key}": ${formControl}` + ','];
    }

    if (currentValueType === VALUE_TYPES.OBJECT) {
      const content = this.process(value, fullKeyPath, currentValueType);

      return previousType === VALUE_TYPES.ARRAY
        ? [OPEN, ...content, CLOSE]
        : [`"${key}": ${OPEN}`, ...content, CLOSE];
    }

    return [];
  }

  private setRules(rules: Rules): void {
    this.rules = rules;
  }

  private extractRules(value: string): string[] {
    return value.split('|');
  }

  private generateValues(rules: any): any[] {
    for (const rule of rules) {
      const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

      if (ruleName === 'in') {
        return ruleParameters;
      }

      const requiresOptionChoices =
        ruleName === 'html' && ['select', 'radio', 'checkbox'].includes(ruleParameters?.[0]);

      if (requiresOptionChoices) {
        return [
          { id: 1, mock: 1 },
          { id: 2, mock: 2 },
          { id: 3, mock: 3 },
        ];
      }
    }

    return [];
  }
}
