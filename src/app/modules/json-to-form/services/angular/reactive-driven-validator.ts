import { wrapLines } from '@shared/utils/string.utils';
import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { FormBuilder, FormStructure } from './function-definition';
import { ValidatorFormContextHelper } from './helper/validator-form-context.helper';
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
    formBuildMode: FormOutputFormat
}

export class Validator {
    private rules: string[];

    public constructor(rules: string[]) {
        this.rules = rules;
    }

    public get(): string[] {
        return this.rules.reduce((acc: string[], rule: string) => {
            acc.push(this.validate('', rule));

            return acc;
        }, [])
            .filter(el => el);
    }

    //$attribute, $value, $parameters, $this
    public validate(attribute: string, rule: string): string {
        let [newRule, parameters] = ValidatorRuleHelper.parseStringRule(rule); //{rule}:{parameters}
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

export enum FormOutputFormat {
    Json = 'JSON',
    AngularFormBuilder = 'ANGULAR_FORM_BUILDER',
    AngularRawInstance = 'ANGULAR_RAW_INSTANCE',
}

export const FORM_OUTPUT_WRAPPERS: any = {
    [FormOutputFormat.Json]: {
        [VALUE_TYPES.ARRAY]: { OPEN: '[', CLOSE: ']' },
        [VALUE_TYPES.OBJECT]: { OPEN: '{', CLOSE: '}' },
        [VALUE_TYPES.STRING]: { OPEN: '"', CLOSE: '"' }
    },
    [FormOutputFormat.AngularFormBuilder]: {
        [VALUE_TYPES.ARRAY]: { OPEN: 'this.formBuilder.array([', CLOSE: '])' },
        [VALUE_TYPES.OBJECT]: { OPEN: 'this.formBuilder.group({', CLOSE: '})' },
        [VALUE_TYPES.STRING]: { OPEN: 'this.formBuilder.control(', CLOSE: ')' }
    },
    [FormOutputFormat.AngularRawInstance]: {
        [VALUE_TYPES.ARRAY]: { OPEN: 'new FormArray([', CLOSE: '])' },
        [VALUE_TYPES.OBJECT]: { OPEN: 'new FormGroup({', CLOSE: '})' },
        [VALUE_TYPES.STRING]: { OPEN: 'new FormControl(', CLOSE: ')' }
    }
} as const;

export class ReactiveDrivenValidator {
    private rules!: any;
    private _options: Options = {
        formName: 'form',
        triggerValidationOnSubmit: true,
        componentName: '',
        container: 'container',
        formBuildMode: FormOutputFormat.AngularFormBuilder
    };
    private componentName!: string;
    private arrayIndex: number = 0;
    private formFields: FormStructure[] = [];
    private optionChoices: string[] = [];
    private index: number = 0;

    constructor(rules: any, componentName: string, private options?: any) {
        this.componentName = componentName;
        this.options = {
            ...this.options,
            formBuildMode: options?.formBuildMode
                ? options?.formBuildMode
                : FormOutputFormat.AngularFormBuilder
        }
        this.setRules(rules);
    }

    public generateFormBuilder(): string[] {
        const { OPEN, CLOSE } = this.getFormWrapper(VALUE_TYPES.OBJECT);

        return [
            `this.${this._options.formName} = ${OPEN}`,
            this.reactiveDrivenValidators(this.rules),
            `${CLOSE};`
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

    private componentDecorator(): string[] {
        const asynPipe = this.observableAttributes().length > 0 ? 'AsyncPipe' : '';
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
                    asynPipe,
                `]`,
            `})`
        ];
    }

    private classAttributes(): string[] {
        return [
            `${this._options.formName}!: FormGroup;`,
            `formSubmitAttempt: boolean = false;`,
            `@Input() data: any;`
        ];
    }

    private getConstructor(): string[] {
        return [
            `constructor(`,
                `private formBuilder: FormBuilder`,
            `) {}`,
        ];
    }

    private getNgOnInit(formGroup: string[]): string[] {
        return [
            `ngOnInit(): void {`,
                `${wrapLines(formGroup)}`,
                // `this.populate()`,
            `}`
        ];
    }

    private observableAttributes(): string[] {
        return this.optionChoices;
    }

    private get getters(): string {
        return wrapLines([
            `get f(): FormGroup {
                return this.form as FormGroup;
            }`,
            ...this.formFields.map((field: FormStructure) => field?.getter.withReturn ?? "")
        ]);
    }

    private get creaters(): string {
        return wrapLines(
            this
            .formFields
            .filter((field: FormStructure) => field.previousValueType === VALUE_TYPES.ARRAY || field.currentValueType === VALUE_TYPES.ARRAY)
            .map((field: FormStructure) => field?.creator.withReturn ?? "")
        );
    }

    private emptyLine(): string {
        return '';
    }

    private submitMethod(): string[] {
        return [
            `onSubmit(): void {`,
                `this.formSubmitAttempt = true;`,
                `if (this.f.valid) {`,
                    `console.log('form submitted');`,
                `}`,
            `}`,
        ]
    }

    private populate(): string[] {
        return [
            `private populate() {`,
            this.buildPopulate(this.rules),
            `this.f.patchValue(this.data);`,
            `}`,
        ]
    }

    public generateComponent(): string[] {
        const formGroup: string[] = this.generateFormBuilder();
        return [
            ...this.imports(),
            this.emptyLine(),
            ...this.componentDecorator(),
            `export class ${ValidatorRuleHelper.camelCasedString(this.componentName)}Component implements OnInit {`,
                ...this.classAttributes(),
                ...this.observableAttributes(),
                this.emptyLine(),
                ...this.getConstructor(),
                this.emptyLine(),
                ...this.getNgOnInit(formGroup),
                this.emptyLine(),
                ...this.submitMethod(),
                this.emptyLine(),
                this.getters,
                this.emptyLine(),
                this.creaters,
                // this.emptyLine(),
                // ...this.populate(),
            `}`
        ];
    }

    private getFormWrapper(type: ValueType): { OPEN: string; CLOSE: string } {
        return FORM_OUTPUT_WRAPPERS[this.options.formBuildMode][type];
    }

    private forEachWrapper(previous: FormStructure, current: FormStructure): [string[], string[]] {
        if(current.previousValueType === VALUE_TYPES.ARRAY) {
            const sliceArray = (arr: string[], n: number) => {
                return arr.slice(n + 1);
            }
            const path = previous.path.map(p => p.replace(/^'|'$/g, '')) || [];
            const lastNull = previous.stack.lastIndexOf(__ARRAY__);
            const key = [
                lastNull === -1 ? 'this.data' : `item${previous.paramCounter - 1}`,
                ...(sliceArray([...path], lastNull) || [])
            ];

            return [
                [
                    `// @ts-ignore`,
                    `${key.join('.')}.forEach((item${previous.paramCounter}, ${previous.lastIndexParam}) => {`,
                    `this.${previous?.getter?.call}.push(this.${current.creator.call})`,
                ], 
                [
                    `});`
                ]
            ]
        }

        return [[], []];
    }

    private buildPopulate(    
        object: { [key: string]: any },
        namesArr: string[] = [],
        previousValueType: ValueType = VALUE_TYPES.OBJECT,
        formStructureStack: FormStructure[] = []
      ): string {
        const populate = Object.keys(object)
          .map((key: string, index: number) => {
            const context = ValidatorFormContextHelper.buildContext({
              object,
              key,
              namesArr,
              previousValueType,
              index,
              currentIndex: this.index,
            });
      
            if (!context) return '';
      
            const {
              value,
              currentValueType,
              fullKeyPath,
              isLastIndexFromValueArray,
              currentFormStructure,
            } = context;
      
            const previousFormStructure = formStructureStack[formStructureStack.length - 1];
            const formContext = {
              current: currentFormStructure,
              previous: previousFormStructure,
            };

            if(
                currentValueType === VALUE_TYPES.ARRAY ||
                currentValueType === VALUE_TYPES.OBJECT ||
                currentValueType === VALUE_TYPES.STRING
            ) {
                this.index = value.length;

                const [openForEach, closeForEach] = this.forEachWrapper(
                    formContext.previous!, formContext.current
                );
                const nextStack = [...formStructureStack, currentFormStructure];
                const innerForEachBlock = currentValueType === VALUE_TYPES.STRING
                    ? ''
                    : this.buildPopulate(value, fullKeyPath, currentValueType, nextStack);
                
                return wrapLines([ ...openForEach, innerForEachBlock, ...closeForEach ].filter(Boolean));
            }
        
            return '';
        })
            .filter(Boolean);
        
        return wrapLines(populate);
    }

    public reactiveDrivenValidators(
        object: { [key: string]: any },
        namesArr: string[] = [],
        previousValueType: ValueType = VALUE_TYPES.OBJECT
    ): string {
        const validators = Object
            .keys(object)
            .map((key: string, index: number) => {
                const value = ValidatorRuleHelper.normalizeValue(object[key]);
                const currentValueType = ValidatorRuleHelper.resolveValueType(value);
                const remainingKeys = ValidatorRuleHelper.createRemainingKeys(namesArr, previousValueType, key, currentValueType);
                const fullKeyPath = [...namesArr, ...remainingKeys];
                if (currentValueType === VALUE_TYPES.ARRAY) {
                    this.arrayIndex = value.length;
                }
                const isNotLastArrayItem = currentValueType !== VALUE_TYPES.ARRAY
                    && previousValueType === VALUE_TYPES.ARRAY
                    && this.arrayIndex - 1 !== index;

                if (isNotLastArrayItem) return '';

                const formStructureTemplate = this.buildFormWrapper(
                    key, value, currentValueType, previousValueType, fullKeyPath
                );
                const formStructure = new FormBuilder(
                    fullKeyPath,
                    previousValueType,
                    currentValueType,
                    formStructureTemplate,
                ).formStructure();

                this.formFields.push({ ...formStructure });

                //value: can be an array ['required', 'min:40'] or either an object {}
                if (currentValueType === VALUE_TYPES.ARRAY) {
                    return wrapLines([
                        previousValueType === VALUE_TYPES.ARRAY ? '' : `"${key}":`,
                        `this.${formStructure.creator.call},`,
                    ]);
                }

                if (previousValueType === VALUE_TYPES.ARRAY && currentValueType === VALUE_TYPES.OBJECT) {
                    return `this.${formStructure.creator.call}`
                }

                if (currentValueType === VALUE_TYPES.OBJECT) {
                    return wrapLines([ ...formStructureTemplate, ',']);
                }

                if (currentValueType === VALUE_TYPES.STRING) {
                    const rules = value.split("|");
                    const optionChoices = this.generateValues(rules);
                    if (optionChoices.length > 0) {
                        this.optionChoices.push(
                            `public ${formStructure.methodName}$ = of(${JSON.stringify(optionChoices)})`
                        );
                    }

                    return previousValueType === VALUE_TYPES.ARRAY
                        ? `this.${formStructure.creator.call}`
                        : formStructureTemplate.toString()
                }

                return '';
            })
            .filter(el => el)

        return wrapLines(validators);
    }

    private buildFormWrapper(
        key: string,
        value: any,
        currentType: ValueType,
        previousType: ValueType,
        fullKeyPath: string[]
    ): string[] {
        const { OPEN, CLOSE } = this.getFormWrapper(currentType);

        if (currentType === VALUE_TYPES.ARRAY) {
            const content = this.reactiveDrivenValidators(value, fullKeyPath, VALUE_TYPES.ARRAY);

            return [OPEN, content, CLOSE];
        }

        if (currentType === VALUE_TYPES.STRING) {
            const rules = value.split("|");
            const ruleParams = new Validator(rules).get();
            const isCheckbox = rules.some((rule: string) => {
                const [ruleName, ruleArgs] = ValidatorRuleHelper.parseStringRule(rule);
                return ruleName === 'html' && ruleArgs?.[0] === 'checkbox';
            });
            const validators = `[${ruleParams.join(",")}]`;
            const formControl = `${OPEN}'' , ${validators}${CLOSE}`;

            return previousType === VALUE_TYPES.ARRAY
                ? [formControl + ';']
                : [`"${key}": ${formControl}` + ','];
        }

        if (currentType === VALUE_TYPES.OBJECT) {
            const content = this.reactiveDrivenValidators(value, fullKeyPath, VALUE_TYPES.OBJECT);

            return previousType === VALUE_TYPES.ARRAY
                ? [OPEN, content, CLOSE]
                : [`"${key}":${OPEN}`, content, CLOSE];
        }

        return [];
    }

    private setRules(rules: Rules): void {
        this.rules = rules;
    }

    private generateValues(rules: any): any[] {
        for (const rule of rules) {
            let [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

            if (ruleName === 'in') {
                return ruleParameters;
            }

            const requiresOptionChoices =
                ruleName === 'html' && ['select', 'radio', 'checkbox'].includes(ruleParameters?.[0]);

            if (requiresOptionChoices) {
                return [
                    { id: 1, mock: 1 },
                    { id: 2, mock: 2 },
                    { id: 3, mock: 3 }
                ];
            }
        }

        return [];
    }
}
