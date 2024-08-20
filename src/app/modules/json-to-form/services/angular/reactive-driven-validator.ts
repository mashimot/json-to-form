import { FormBuilder } from '@angular/forms';
import { FunctionDefinition } from './function-definition';
import { Definition } from './models/Definition';
import { ValidatorRuleHelper } from './validator-rule-helper';
import { ReservedWordEnum } from '../../enums/reserved-name.enum';
import { ValueType } from './models/value.type.';

interface Rules {
    [name: string]: any;
}

interface Options {
    formName: string;
    triggerValidationOnSubmit?: boolean;
    container?: 'container' | 'container-fluid';
    componentName: string;
}

export class Validator {
    rules: string[];

    public constructor(rules: string[]) {
        this.rules = rules;
    }

    public get() {
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

export class ReactiveDrivenValidator {
    rules!: any;
    functions: Definition[] = [];
    getters: string[] = [];
    _options: Options = {
        formName: 'form',
        triggerValidationOnSubmit: true,
        componentName: '',
        container: 'container'
    };
    componentName!: string;
    private index = 0;

    constructor(rules: any, componentName: string) {
        this.componentName = componentName;
        this.setRules(rules);
    }

    public generateFormBuilder(): string[] {
        return [
            `this.${this._options.formName} = this.formBuilder.group({`,
            this.reactiveDrivenValidators(this.rules),
            `});`
        ];
    }

    public generateComponent(): string[] {
        const attributes: string[] = [];
        const observables: string[] = [];
        const definitions: string[] = [];
        const formGroup: string[] = this.generateFormBuilder();

        this.functions.forEach((item: Definition) => {
            if (item.get) {
                item.get.forEach((currentGet: any) => {
                    definitions.push(currentGet.get('get_function'));
                    definitions.push(currentGet.get('delete_function'));
                    definitions.push(currentGet.get('create_function'));
                })
            }
            if (item.mockData) {
                definitions.push([
                    `${item.mockData.get_name}$(){`,
                    `return of(${JSON.stringify(item.mockData.values)})`,
                    `.pipe(
                        shareReplay(1),
                        delay(2000)
                    )`,
                    `}`
                ].join("\n"));
                attributes.push(`${item.mockData.parameter_name}$!: Observable<any>`);
                observables.push(`${item.mockData.parameter_name}$ = this.${item.mockData.get_name}$();`);
            }
        });

        let component = [
            `import { Component, OnInit } from '@angular/core'`,
            `import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms'`,
            `import { Observable, of } from 'rxjs';`,
            `import { delay, shareReplay } from 'rxjs/operators';`,
            `
            @Component({
                selector: 'app-${this.componentName}',
                templateUrl: './${this.componentName}.component.html',
                styleUrls: ['./${this.componentName}.component.css']
            })
            export class ${ValidatorRuleHelper.camelCasedString(this.componentName)}Component implements OnInit {
                ${this._options.formName}!: FormGroup;
                formSubmitAttempt: boolean = false;
                ${attributes.map(v => `${v};`).join("\n")}
                constructor(
                    private formBuilder: FormBuilder
                ) { }

                ngOnInit(): void {
                    ${`${observables.map((o) => `this.${o}`).join("\n")}`}
                    ${formGroup.join("\n")}
                }
                
                onSubmit(): void {
                    this.formSubmitAttempt = true;
                    if (this.f.valid) {
                        console.log('form submitted');
                    } else {
                        this.validateAllFormFields(this.f);
                    }
                }

                validateAllFormFields(control: AbstractControl): void {
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

                getField(path: (string | number)[] | string): {
                    name: string,
                    id: string,
                    abstractControl: AbstractControl | null | any,
                    isFieldValid: boolean | undefined
                } {
                    return {
                        name: typeof path === 'string' ? path : path.join('.'),
                        id: typeof path === 'string' ? path : path.join('-'),
                        abstractControl: this.f.get(path),
                        isFieldValid: this.f.get(path)?.invalid && this.f.get(path)?.touched
                    }
                }

                get f(): FormGroup {
                    return this.form as FormGroup;
                }

                ${this.getters.join("\n")}
                ${definitions.join("\n")}                
            }
            `
        ];

        return component;
    }


    public reactiveDrivenValidators(
        object: { [key: string]: any },
        namesArr: (string | boolean)[] = [],
        previousValueType: ValueType = 'object'
    ): string {
        return Object
            .keys(object)
            .map((key: any, index: number) => {
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
                });
                const dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyNameSplitDot);
                let functionDefinition: Definition = {
                    get: [],
                    formBuilder: []
                };

                if(!isValueAnArray && previousValueType === 'array' && this.index - 1 !== index) {
                    return '';
                }
                
                if (!isValueAnArray && previousValueType === 'array') {
                    let formBuilder: string[] = [];

                    if (isValueString) {
                        const rules = value.split("|");
                        const ruleParameters = new Validator(rules).get();
                        formBuilder = [`this.formBuilder.control('', [${ruleParameters.join(",")}]);`];
                        rules.forEach((rule: any) => {
                            const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);
                            if (ruleName === 'html') {
                                if (ruleParameters?.[0] === 'checkbox') {
                                    formBuilder = [`this.formBuilder.array([])`];
                                }
                            }
                        });
                    }  else {
                        formBuilder = [
                            `this.formBuilder.group({`,
                                `${this.reactiveDrivenValidators(value, completeKeyName, 'object')}`,
                            `})`
                        ];
                    }

                    functionDefinition = new FunctionDefinition(
                        completeKeyNameSplitDot,
                        formBuilder
                    )
                    .get();

                    this.functions.push(functionDefinition);
                }

                //value: can be an array ['required', 'min:40'] or either an object {}
                //rule when key ends with an asterisk, so must turn into an array
                if (isValueAnArray) {
                    return this.reactiveDrivenValidators(value, completeKeyName, 'array');
                } else {
                    if (!completeKeyNameSplitDot.includes(ReservedWordEnum.__ARRAY__)) {
                        this.generateGetters(completeKeyNameSplitDot, dotNotationSplit, isValueAnObject);
                    }
                }

                if (isValueAnObject) {
                    //key has asterisk
                    if (previousValueType === 'array' && this.index - 1 !== index) {
                        const key = ValidatorRuleHelper.removeAsteriskFromString(completeKeyNameSplitDot);
                        const newKey = key[key.length - 1];
                        return [
                            `"${newKey}":`,
                            functionDefinition.formBuilder.join("\n"),
                        ]
                            .join('\n');
                    }

                    if(previousValueType === 'array') {
                        const key = ValidatorRuleHelper.removeAsteriskFromString(completeKeyNameSplitDot);
                        const newKey = key[key.length - 1];

                        return [
                            `"${newKey}":`,
                            functionDefinition.formBuilder.join("\n"),
                        ]
                            .join('\n');
                    }

                    return [
                        `"${key}": this.formBuilder.group({`,
                            `${this.reactiveDrivenValidators(value, completeKeyName, 'object')}`,
                        `}),`
                    ]
                        .join('\n');
                }

                if (isValueString) {
                    if (previousValueType === 'array') {
                        const key = ValidatorRuleHelper.removeAsteriskFromString(completeKeyNameSplitDot);
                        const newKey = key[key.length - 1];
                        return [
                            `"${newKey}":`,
                            functionDefinition.formBuilder.join("\n"),
                        ]
                            .join('\n');
                    }

                    const rules = value.split('|');
                    const ruleParameters = new Validator(rules).get();
                    const values = this.generateValues(rules);

                    if (values.length > 0) {
                        functionDefinition.mockData = {
                            parameter_name: ValidatorRuleHelper.camelCasedString(dotNotationSplit.join("."), true),
                            get_name: `get${ValidatorRuleHelper.camelCasedString(dotNotationSplit.join("."))}`,
                            values: values
                        }
                    }

                    return [`"${key}": ['', [${ruleParameters.join(",")}]],`];
                }

                return '';
            })
            .join("\n");
    }

    private generateValues(rules: any): any[] {
        return rules.reduce((acc: any, rule: any) => {
            let [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);
            if (ruleName === 'in') {
                return ruleParameters;
            }

            if (
                ruleName === 'html' &&
                ['select', 'radio', 'checkbox'].includes(ruleParameters[0])
            ) {
                acc = [{
                    id: 1,
                    mock: 1
                }, {
                    id: 2,
                    mock: 2
                }, {
                    id: 3,
                    mock: 3
                }];
            }

            return acc;
        }, []);
    }

    private generateGetters(completeKeyNameSplitDot: string[], dotNotationSplit: string[], isValueAnObject: boolean): void {
        const path: string = `[${ValidatorRuleHelper.getField(completeKeyNameSplitDot).join(",")}]`;
        const getterFunctionName = ValidatorRuleHelper.camelCasedString(
            dotNotationSplit
                .filter((el: any) => el !== ReservedWordEnum.__ARRAY__)
                .join(""),
            true
        );
        const formType = isValueAnObject ? 'FormGroup' : 'FormControl';
        this.getters.push(
            `get ${getterFunctionName}(): ${formType} {
                return this.f.get(${path}) as ${formType};
            }`
        );
    }

    private setRules(rules: Rules): void {
        this.rules = rules;
    }
}
