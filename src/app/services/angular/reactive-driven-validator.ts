import { Definition } from './models/Definition';
import { FunctionDefinition } from './function-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

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

     public constructor(rules: string[]){
        this.rules = rules;
    }

    public get(){
        return this.rules.reduce((acc: string[], rule: any) => {
            acc.push(
                this.validate(
                    '',
                    rule
                )
            );

            return acc;
        }, [])
        .filter(el => el);
    }

    //$attribute, $value, $parameters, $this
    public validate(attribute: string, rule: string): string {
        let [newRule, parameters] = ValidatorRuleHelper.parseStringRule(rule); //{rule}:{parameters}
		//$value = $this->getValue($attribute);

        if (newRule == 'min') {
            return this.validateMin(parameters);
        }
        if (newRule == 'max') {
            return this.validateMax(parameters);
        }
        if (newRule == 'required') {
            return this.validateRequired();
        }
        if (newRule == 'email') {
            return this.validateEmail();
        }
        if (newRule == 'between_length') {
            return this.validateBetweenLength(parameters);
        }

        return '';
    }

    public validateBetweenLength(parameters: string[]) : string
    {
        return `ArrayValidators.betweenLength(${parameters[0]})`;
    }

    public validateMax(parameters: string[]) : string
    {
        return `Validators.maxLength(${parameters[0]})`;
    }

    public validateEmail() : string
    {
        return `Validators.email`;
    }
    
    public validateMin(parameters: string[]) : string
    {
        return `Validators.minLength(${parameters[0]})`;
    }
    
    public validateRequired() : string
    {
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
    
    constructor(rules: any, componentName: string) {
        this.componentName = componentName;
        this.setRules(rules);
    }

    public generate() {
        return [
            `this.${this._options.formName} = this.formBuilder.group({`,
            this.reactiveDrivenValidators(this.rules),
            `});`
        ];
    }

    public generateComponent() : string[] {
        let initVariables: string[] = [];
        let initObservables: string[] = [];
        let definitions: string[] = [];
        let init: string[] = this.generate();
        console.log('this.functions', this.functions);
        this.functions.forEach((item: any) => {
            if(item.get){
                item.get.forEach((currentGet: any) => {
                    definitions.push(currentGet.get('get_function'));
                    definitions.push(currentGet.get('delete_function'));
                    definitions.push(currentGet.get('create_function'));
                })
            }
            if(item.mockData){
                // console.log('item.mockData', item.mockData)
                definitions.push([
                    `${item.mockData.get_name}$(){`,
                    `return of(${JSON.stringify(item.mockData.values)})`,
                    `.pipe(
                        delay(2000)
                    )`,
                    `}`
                ].join("\n"));
                initVariables.push(`${item.mockData.parameter_name}$!: Observable<any>;`);
                initObservables.push(`${item.mockData.parameter_name}$ = this.${item.mockData.get_name}$();`);
            }
        });
        
        let component = [
            `import { Component, OnInit } from '@angular/core'`,
            `import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms'`,
            `import { Observable, of } from 'rxjs';`,
            `import { delay } from 'rxjs/operators';`,
            `
            @Component({
                selector: 'app-${this.componentName}',
                templateUrl: './${this.componentName}.component.html',
                styleUrls: ['./${this.componentName}.component.css']
            })
            export class ${ValidatorRuleHelper.camelCasedString(this.componentName)}Component implements OnInit {              
                ${this._options.formName}!: FormGroup;
                formSubmitAttempt: boolean = false;
                ${initVariables.join(";\n")}
                constructor(
                    private formBuilder: FormBuilder
                ) { }

                ngOnInit(): void {
                    ${`${initObservables.map((v) =>  `this.${v}`).join("\n")}`}
                    ${init.join("\n")}
                }
                
                onSubmit(): void {
                    this.formSubmitAttempt = true;
                    if (this.f.valid) {
                        console.log('form submitted');
                    } else {
                        this.validateAllFormFields(this.f);
                    }
                }

                validateAllFormFields(control: AbstractControl) {
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

                get f(){
                    return this.form;
                }

                isFieldValid(field: string) {
                    return !this.f.get(field)?.valid && this.f.get(field)?.touched;
                }

                getField(field: string) {
                    return this.f.get(field);
                }

                ${this.getters.join("\n")}
                ${definitions.join("\n")}                
            `
        ];
        
        component.push("}");
        return component;
    }

    protected reactiveDrivenValidators(object: { [key: string]: any }, names: string = '', parameters: string[] = []): string {
        return Object.keys(object)
            .map((key: any) => {
                let value = object[key];
                let rest = names.length ? '.' + key : key;
                let completeKeyName = (names + rest).split('.');
				const completeKeyNameEndsWithAsterisk = completeKeyName[completeKeyName.length - 1] == '*'
					? true
					: false;                
                let dotNotation = ValidatorRuleHelper.dotNotation(completeKeyName);
                let functionDefinition: Definition = {
					get: [],
					lastDefinition: new Map(),
					formBuilder: []
				};
                let keyNameSplit = key.split('.');
                let firstNameBeforeDot = keyNameSplit[0];
                //value: can be an array ['required', 'min:40'] or an object {}
                let isValueAnArray = Array.isArray(value) ? true : false;

                //key has asterisk, so must turn into an array
                if (completeKeyNameEndsWithAsterisk) {
                    let formBuilderGroup: string[] = [];
                    parameters = parameters.concat(
                        ValidatorRuleHelper.defineIndexName(completeKeyName, keyNameSplit)
                    );
                    
                    //"key.*": ['required', 'min:10']
                    if(isValueAnArray){
                        const rules = value;
                        const ruleParameters = new Validator(rules).get();
                        formBuilderGroup = [`this.formBuilder.control('', [${ruleParameters.join(",")}]);`];            
                    } else { //"key.*": { "any: ['required', 'min:10']" }
                        formBuilderGroup = [
                            `this.formBuilder.group({`,
                            `${this.reactiveDrivenValidators(value, names + rest, parameters)}`,
                            `})`,
                        ];
                    }
                
                    functionDefinition = new FunctionDefinition(
                        parameters,
                        completeKeyName,
                        formBuilderGroup
                    ).get();

                } else {
                    if(!completeKeyName.includes('*')){
                        const keyNameDotNotation: string = completeKeyName.join(".");
                        let getterFunctionName = ValidatorRuleHelper.camelCasedString(
                            dotNotation
                                .filter((el: string) => el != '*')
                                .join(""),
                            true		
                        );
                
                        this.getters.push(
                            `get ${getterFunctionName}(){
                                return this.f.get('${keyNameDotNotation}');
                            }`
                        );
                    }
                }
                this.functions.push(functionDefinition);
                
                if (Object.prototype.toString.call(value) == '[object Object]') {
                    //key has asterisk
                    if (completeKeyNameEndsWithAsterisk) {
                        parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);

                        return [
                            `"${firstNameBeforeDot}":`,
                            functionDefinition.formBuilder.join("\n"),
                        ]
                        .join('\n');
                    }

                    return [
                        `"${key}": this.formBuilder.group({`,
                        `${this.reactiveDrivenValidators(value, names + rest, parameters)}`,
                        `}),`
                    ]
                    .join('\n');
                }

                if (Array.isArray(value)) {
                    const rules = value;
                    const ruleParameters = new Validator(rules).get();
                    const values = rules.reduce((accArr, rule) => {
                        let [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);
                        if (ruleName == 'in') {
                            return ruleParameters;
                        }

                        if(
                            ruleName == 'html' &&
                            ['select', 'radio', 'checkbox'].includes(ruleParameters[0])
                        ){
                            return [{
                                id: 1,
                                mock: 1
                            },{
                                id: 2,
                                mock: 2
                            },{
                                id: 3,
                                mock: 3
                            }];
                        }

                        return accArr;
                    }, []);

                    if(values.length > 0){
                        functionDefinition.mockData = {
                            parameter_name: ValidatorRuleHelper.camelCasedString(dotNotation.join("."), true),
                            get_name: `get${ValidatorRuleHelper.camelCasedString(dotNotation.join("."))}`,
                            values: values
                        }
                    }
                    
                    parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
            
                    if(completeKeyNameEndsWithAsterisk){ //key has asterisk
                        return `"${firstNameBeforeDot}": ${functionDefinition.formBuilder.join("\n")}`;
                    }
                    
                    return `"${key}": ['', [${ruleParameters.join(",")}]],`
                }

                return '';
            }).join("\n");
    }

    private setRules(rules: Rules) {
        this.rules = ValidatorRuleHelper.splitRules(rules);
    }
}