import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { js_beautify, html_beautify } from 'js-beautify';
import { JsonToFormExampleService } from './../json-to-form-example.service';

class JsonValidators {
    static validateObject(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const error: ValidationErrors = { 
                invalidJson: true
            };

            let object = control.value;
            if(typeof control.value == 'string'){
                object = JSON.parse(control.value);
            }

            console.log('object', object, typeof object);
            if(typeof object == 'undefined'){
                error.messages = ['JSON undefined'];
                control.setErrors(error);
                return error;
            }

            let isArray = Array.isArray(object);

            if (Object.prototype.toString.call(object) != '[object Object]') {
                error.messages = ['JSON should start with curly brackets'];
                return error;
            }

            if(Object.keys(object).length <= 0){
                error.messages = ['JSON must be not empty'];
                control.setErrors(error);
                return error;
            }

            let errors: string[] = ValidatorRuleHelper.validateObject(object);
            if(errors.length > 0){
                error.messages = errors;
                control.setErrors(error);
                return error;
            }

            control.setErrors(null);
            return null;
        }
    }

}

interface Rules {
    [name: string]: any;
}

interface IDefinition {
    lastDefinition: string[],
    formBuilderArray: {
        open: string[],
        close: string[]
    };
    formArrayName: {
        open: string[],
        close: string[]
    };
}

interface Options {
    formName: string;
    triggerValidationOnSubmit?: boolean;
    container?: 'container' | 'container-fluid';
    componentName: string;
}

interface IGetterDefinition {
    completeKeyName: string[];
    name: string;
    parameters: string[];
    formBuilderGroup?: string[];
    arrayValidators?: string[];
}

class ValidatorRuleHelper {

    public static removeParameters(n: string[], parameters: string[]):string[]{
        
        for(let i = n.length - 1; i >= 0; i--){
            let item = n[i];
            if (item != '*') {
                break;
            }
            parameters.splice(-1, 1);
        }

        return parameters;
    }

    public static htmlSelectorRe = /^[a-zA-Z][.0-9a-zA-Z]*(:?-[a-zA-Z][.0-9a-zA-Z]*)*$/;
    public static validateHtmlSelector(selector: string): string | boolean {
        if (selector && !ValidatorRuleHelper.htmlSelectorRe.test(selector)) {
            return `Selector (${selector}) is invalid.`;
        }

        return true;
    }

    public static bracketsNotation(string: string[]): string[] {
        let id:any = []
        string.forEach((v, index) => {
            //let v = item.split(".");
            if(v.trim() == "*"){
                v = '';;    
            }
            id[index] = `[${v}]`;
            if(index == 0){
                id[0] = v
            }
        });

        return id;
    }

    public static validateObject(obj: any, names: string = '', errors:string[] = []): string[]{
        return Object.keys(obj)
            .map((k: any) => {
                let v = obj[k];
                let rest = names.length > 0
                    ? '.' + k
                    : k;
                const re = /^[a-zA-Z0-9_-]*(\.\*)*$/;

                if (!re.test(k)) {
                    errors.push(`Errors at:  "${names + rest}"`);
                }

                if (Object.prototype.toString.call(v) == '[object Object]') {
                    ValidatorRuleHelper.validateObject(v, names + rest, errors);
                }

                return errors;
            })[0];
    }

    public static validateObjectOld(obj: any, names: string = '', errors:string[] = []): any{
        if(typeof obj == 'undefined'){
            return [
                'WOO'
            ];
        }

        let isArray = Array.isArray(obj);

        if(isArray){
            return [
                'JSON should start with curly brackets'
            ];
        }
        
        if(Object.keys(obj).length <= 0){
            return [
                'JSON must be not empty'
            ];
        }

        return Object.keys(obj)
            .map((k: any) => {
                let v = obj[k];
                let rest = names.length > 0
                    ? '.' + k
                    : k;
                const re = /^[a-zA-Z0-9_-]*(\.\*)*$/;

                if (!re.test(k)) {
                    errors.push(`Errors at:  "${names + rest}"`);
                }

                if (Object.prototype.toString.call(v) == '[object Object]') {
                    ValidatorRuleHelper.validateObject(v, names + rest, errors);
                }

                return errors;
            })[0];
    }

    public static parseStringRule(rule: string | any[]): Array<any>
    {
        if (typeof rule == 'string') {
            var afterColon = rule.substr( rule.indexOf(':') + 1 );

            if (rule.indexOf(':') != -1) {
                let data = [
                    rule.split(':')[0],
                    [afterColon]
                ];

                return data;
            }
        }

        if (Array.isArray(rule)) {
            if(!rule) {
                return [
                    'in',
                    []
                ];
            }

            let arr = [rule.join(",")]
            return [
                'in',
                rule
            ];
        }
        
        return [
            rule,
            []
        ];
    }
    
    public static camelCasedString(string: any, isFirstLetterLowerCase: boolean = false) {

        if (string == null || string == '') {
            return '';
        }
            
        const camelCase = string
            .toLowerCase()
            .match(/[A-Z0-9]+/ig)
            .map(function (word: any, i:number) {
                if (!i) return word;
                return word[0].toUpperCase() + word.slice(1); // return newly formed string
            })
            .join("");

        const firstLetter = isFirstLetterLowerCase
            ? camelCase[0].toLowerCase()
            : camelCase[0].toUpperCase();

        return `${firstLetter}${camelCase.slice(1)}`;
    }

    //['users', '*', 'address', 'number']
    //users.*.address.number
    //['users.', '*', '.address.number']
    //['users', '*', 'address.number']
    //'users|*|address.number'
    //['users', '*', 'address.number']
    public static dotNotation(string: string[]): string[] {
        if(string.length <= 0){
            return [];
        }
        
        return string.join(".")
            .split('*')
            .map(str => {
                return str.replace(/(^\.+|\.+$)/mg, '');
            })
            .join("|*|")
            .split("|")
            .filter(el => el);
    }   

    public static splitRules(obj: any): any {

        let rules = Object.keys(obj).map((k) => {
            let v = obj[k];
            if (Object.prototype.toString.call(v) == '[object Object]') {
                return {
                    [k]: this.splitRules(v)
                }
            }
            
            //split and then converts into array of rules
            if (typeof v === 'string') {
                return {
                    [k]: v.split("|")
                };
            }

            if (Array.isArray(v)) {
                return {
                    [k]: v
                }
            }

            return null;
            
        });

        let asObject = Object.assign({}, ...rules);
        return asObject;
    }
}

class ValidatorDefinition {
    private static CREATE: string = 'create';
    private static DELETE: string = 'delete';
    private static FORM_BUILDER: string = 'formBuilder';

    public constructor(){

    }

    public static get(element: any): any {
        let definition: any = {
            get: [],
            lastDefinition: {},
            formBuilderArray: {
                open: [],
                close: []
            }
        };
        let parameters = [...element.parameters] ?? [];
        let completeKeyName = [...element.completeKeyName]
        let keyNameDotNotation = [...ValidatorRuleHelper.dotNotation(completeKeyName)];
        //let isValueAnArray = element.isValueAnArray ? element.isValueAnArray : false;
        let formBuilderGroup = typeof element.formBuilderGroup != 'undefined'
            ? element.formBuilderGroup.join("")
            : '';

        if (parameters.length <= 0) {
            return definition;
        }
       
        let returnFunction = [...keyNameDotNotation];
        let count = 0;
        for (let i = 0; i < keyNameDotNotation.length; i++) {
            const item = keyNameDotNotation[i];
            if (item == '*') {
                const currentParameter = parameters[count];
                returnFunction[i] = ` as FormArray).at(${currentParameter})`
                count++;
            } else {
                returnFunction[i] = `.get('${item}')`;
                if (i == 0) {
                    returnFunction[i] = `this.form${returnFunction[i]}`;
                }
            }
        }
        
        let functionName = ValidatorRuleHelper.camelCasedString(keyNameDotNotation.join(""));
        let get = [];
        let counterAsterisk = 0;
        for (let i = keyNameDotNotation.length - 1; i >= 0; i--) {
            if (keyNameDotNotation[i] != '*') {
                break;
            }
            counterAsterisk++;
        }

        for (let i = counterAsterisk - 1; i >= 0; i--) {
            let data: any = {};
            const getFunctionName = `get${functionName}${i > 0 ? i : ''}`;
            const lastIndex = parameters[parameters.length - 1];

            parameters.splice(-1, 1);
            returnFunction.splice(-1, 1);

            definition.completeKeyName = completeKeyName.join(".");
            definition.formBuilderArray.open.push(`this.${this.FORM_BUILDER}.array([`);
            definition.formBuilderArray.close.push(`])`);

            const parametersWithLastIndex = [...parameters];
            parametersWithLastIndex.push(lastIndex);
            data.parameters = `(${parameters.map((p: any) => `${p}`).join(",")})`;
            data.parameters_typed = `(${parameters.map((p: any) => `${p}:number`).join(",")})`;
            data.parameters_with_last_index = `(${parametersWithLastIndex.map((p: any) => `${p}`).join(",")})`;
            data.parameters_with_last_index_typed = `(${parametersWithLastIndex.map((p: any) => `${p}:number`).join(",")})`;
            data.function_name = `${functionName}${i > 0 ? i : ''}`;
            data.get_function_name = getFunctionName;
            data.get_with_parameters = `${getFunctionName}(${parameters.map((p: any) => `${p}`).join(",")})`;
            data.get_at = `${data.get_with_parameters}.at(${lastIndex})`;
            data.index = parameters[i];
            data.second_to_last_index = parameters[parameters.length - 1];
            data.last_index = lastIndex;
            data.get_function = [
                `${getFunctionName}${data.parameters_typed}: FormArray {`,
                    `return ${parameters.map(() => '(').join("")}${returnFunction.join("")} as FormArray;`,
                `}`
            ].join("\n");
            data.delete_function = [
                `${this.DELETE}${data.function_name}${data.parameters_with_last_index_typed}:void {`,
                    `this.${data.get_with_parameters}.removeAt(${lastIndex})`,
                `}`
            ].join("\n");
            data.delete = [
                `${this.DELETE}${data.function_name}${data.parameters_with_last_index}`
            ].join("\n");
    
            data.create_function = [
                `${this.CREATE}${data.function_name}(){`,
                    `return ${
                        i == counterAsterisk - 1
                            ? formBuilderGroup
                            : [
                                definition.formBuilderArray.open.splice(-1, 1).join("\n"),
                                `this.${this.CREATE}${functionName}${i + 1}()`,
                                definition.formBuilderArray.close.splice(-1, 1).join(",\n")
                            ].join("\n")
                    }`,
                `}`
            ].join("\n");
            
            data.create = [
                `${data.get_with_parameters}.push(${this.CREATE}${data.function_name}())`
            ].join("\n");
            get.unshift(data);
        }

        definition.formBuilder = [
            `this.${this.FORM_BUILDER}.array([`,
            `this.${this.CREATE}${get[0].function_name}()`,
            `]),`
        ];
        
        if (get.length > 0) {
            definition.get = get;
            definition.lastDefinition = get[get.length - 1];
        }

        //console.log(definition);
        return definition;
    }
}

class ReactiveDrivenHtml {
    rules!: any;
    attribute!: string;
    parameters?: any;
    triggerValidationOnSubmit: boolean = true;
    formName: string = 'form';

    constructor(rules: any) {
        this.setRules(rules)
    }

    public setFormName(formName: string): void {
        this.formName = formName
    }

    public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
        this.triggerValidationOnSubmit = triggerValidationOnSubmit;
    }

    public generate() : string[] {
        return [
            `<div class="container">`,
            `<form [formGroup]="${this.formName}" (ngSubmit)="onSubmit()">`,
            `<pre>{{ ${this.formName}.value | json }}</pre>`,
            this.reactiveDrivenHtml(this.rules),
            `<button type="submit" class="btn btn-primary">`,
            `Submit`,
            `</button>`,
            `</form>`,
            `</div>`
        ];
    }

    public dot_notation: any = [];

    public reactiveDrivenHtml(object: any, names: string = '', parameters: any = [], lastDefinition: any = []): string {
        let drivenHtml = Object.keys(object)
            .map((key: any) => {
                let value = object[key];
                let keyNameSplit = key.split('.');
                let firstKeyNameBeforedot = keyNameSplit[0];
                let definition:any = null;
                let rest = names.length > 0 ? '.' + key : key;
                let completeKeyName = (names + rest).split('.');
                this.dot_notation = ValidatorRuleHelper.dotNotation(completeKeyName);

                if (key.trim().startsWith('$')) {
                    return '';
                }
                
                if (completeKeyName[completeKeyName.length - 1] == '*') {
                    let index = 0;
                    for (let i = completeKeyName.length - 1; i >= 0; i--) {
                        if (completeKeyName[i] != '*') {
                            break;
                        }
                        let rand = ValidatorRuleHelper.camelCasedString(keyNameSplit.join(""));
                        rand = `index${rand}${index == 0 ? '' : index}`;
                        parameters.push(rand);
                        index++;
                    }
                    
                    definition = ValidatorDefinition.get({
                        completeKeyName: completeKeyName,
                        name: firstKeyNameBeforedot,
                        parameters: parameters
                    });
                    
                    if (Object.keys(definition.lastDefinition).length > 0) {
                        lastDefinition.push(definition);
                    }
                }

                if (Object.prototype.toString.call(value) == '[object Object]') {
                    if(completeKeyName[completeKeyName.length - 1] != '*'){
                        return [
                            `<div formGroupName="${key}">`,
                            `${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
                            `</div>`
                        ]
                        .join('\n');
                    }


                    let formArray: {
                        open: string[],
                        close: string[]
                    } = {
                        open: [],
                        close: []
                    }

                    definition.get.forEach((item: any, i: number) => {
                        const formArrayName: string = i <= 0
                            ? `formArrayName="${firstKeyNameBeforedot}"`
                            : `[formArrayName]="${item.second_to_last_index}"`;

                        formArray.open.push(
                            `<fieldset ${formArrayName} class="border border-dark p-2">
                                <pre>{{ ${item.get_with_parameters}.errors | json }}</pre>
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-primary btn-block btn-sm" (click)="${item.create}">ADD ${item.function_name}</button>
                                </div>
                                <div 
                                    *ngFor="let ${item.function_name}${i + 1} of ${item.get_with_parameters}.controls; let ${/*_parametersAux[pos + (i + 1)]*/ item.last_index} = index;"
                                    class="border border-dark p-2"
                                    ${i == definition.get.length - 1? `[formGroupName]="${item.last_index}"`: ``}
                                >
                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button type="button" class="btn btn-danger btn-sm" (click)="${item.delete}">DELETE ${item.function_name}</button>
                                    </div>`
                        );

                        formArray.close.push('</div>');
                        formArray.close.push('</fieldset>');
                    });

                    const FORM_ARRAY: string[] = [
                        formArray.open.join("\n"),
                            `${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
                        formArray.close.join("\n"),
                    ];
                    
                    //refresh the parameters list
                    parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
                    lastDefinition.pop();

                    return FORM_ARRAY.join("\n");
                }
                
                if (Array.isArray(value)) {
                    let messages: string[] = [];
                    const rules = value;
                    let keyNameDotNotation = completeKeyName.join(".");
                    let formControlName = 'formControlName';
                    let getField = `getField('${keyNameDotNotation}')`;
                    let isFieldValid = `isFieldValid('${keyNameDotNotation}')`;
                    let get:any = lastDefinition[lastDefinition.length - 1];
                    let id = this.dot_notation[this.dot_notation.length - 1];
                    var index = firstKeyNameBeforedot;
                    
                    //key has asterisk
                    if (lastDefinition.length > 0) {
                        let getId = `.get('${id}')`;

                        if(id == '*'){
                            getId = ''
                            formControlName = '[formControlName]';
                            index = get.lastDefinition.last_index;
                        } 
                        getField = `${get.lastDefinition.get_at}${getId}`;
                        isFieldValid = `!${getField}?.valid`
                    }

                    const ngClass = `[class.is-invalid]="${isFieldValid}"`
                    const defaultInput = [`<input type="text" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`].join('\n');
                    let input_html = defaultInput;

                    for (let i = 0; i < rules.length; i++) {
                        const rule = rules[i];
                        const parsed = ValidatorRuleHelper.parseStringRule(rule);
                        this.attribute = parsed[0];
                        this.parameters = parsed[1];
                        messages.push(
                            this.getErrorsMessages(getField, keyNameDotNotation)
                        );

                        if (this.attribute == 'html') {
                            let input: {
                                [key:string]: string
                            } = {
                                'file': `<input type="file" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                                'password': `<input type="password" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                                'email': `<input type="email" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                                'number': `<input type="number" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                                'date': `<input type="date" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
                                'textarea': `<textarea ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" cols="30" rows="10" ${ngClass}></textarea>`
                            };
                            input_html = typeof input[this.parameters[0]] != 'undefined'
                                ? input[this.parameters[0]]
                                : defaultInput;

                            const keyNameWithoutAsterisk = this.dot_notation.filter((el:string) => el != '*').join("");
                            if (this.parameters[0] == 'select') {
                                const options = [
                                    `<option *ngFor="let data of (${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async)" [ngValue]="data">`,
                                    `{{ data | json }}`,
                                    `</option>`
                                ];
                                
                                input_html = `<select ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>${options.join("\n")}</select>`;
                            }
                            if (this.parameters[0] == 'radio') {    
                                if(id == '*'){
                                    index = `{{ ${index} }}`;
                                }
                                input_html = [
                                    `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as data$">`,
                                        `<div *ngFor="let data of data$; let index${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)} = index;">`,
                                            `<div class="form-check">`,
                                                `<input type="radio" formControlName="${index}" [value]="data" ${ngClass}>{{ data | json }}`,
                                            `</div>`,
                                        `</div>`,
                                    `</div>`
                                ].join("\n");
                            }
                            if (this.parameters[0] == 'checkbox') {       
                                input_html = [
                                    `<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as data">`,
                                        `<div *ngFor="let d of data; let index${ValidatorRuleHelper.camelCasedString(id)} = index;">`,                                    
                                            `<div class="form-check">`,
                                                `<input type="checkbox" ${formControlName}="${index}" class="form-check-input" ${ngClass} [value]="d"> {{ d }}`,
                                            `</div>`,
                                        `</div>`,
                                    `</div>`
                                ].join("\n");
                            }
                        }                   
                    }

                    if (definition != null) {
                        parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
                        lastDefinition.pop();
                        let formArray: string[] = [];
                        definition.get.forEach((item: any, i: number) => {
                            let formArrayName: string = i <= 0
                                ? `formArrayName="${firstKeyNameBeforedot}"`
                                : `[formArrayName]="${item.second_to_last_index}"`;
                            formArray.push(
                                `<div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" (click)="${item.get_with_parameters}.push(create${item.function_name}())" class="btn btn-primary btn-sm">add ${item.function_name}</button>
                                </div>
                                <div
                                    ${formArrayName}
                                    *ngFor="let h of ${item.get_with_parameters}!.controls; let ${item.last_index} = index;"
                                >
                                    <div class="form-group col-md-12">
                                        <label id="${id}">${keyNameDotNotation}</label>
                                        <div class="input-group mb-3">
                                            ${input_html}
                                            <button type="button" (click)="${item.delete}" class="btn btn-danger btn-sm">
                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete
                                            </button>
                                            <div *ngIf="${isFieldValid}" class="invalid-feedback">
                                                ${messages.join("")}
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                            );
                        });

                        return formArray.join("\n");
                    }

                    return [
                        `<div class="form-group col-md-12">`,
                            `<label id="${id}">${keyNameDotNotation}</label>`,
                            `${input_html}`,
                            `<div *ngIf="${isFieldValid}" class="invalid-feedback">`,
                                `${messages.join("")}`,
                            `</div>`,
                        `</div>`,
                    ].join("\n");
                }

                return '';
            }).join("\n");
    
        

        return drivenHtml;
    }

    protected getErrorsMessages(getField: string = '', objName: string): string {

        if (this.attribute == 'required') {
            return `<div *ngIf="${getField}!.errors?.required">${objName.toUpperCase()} is required</div>`;
        }
        if (this.attribute == 'min') {
            return `<div *ngIf="${getField}!.errors?.minlength">${objName.toUpperCase()} min must be ${this.parameters[0]}</div>`
        }
        if (this.attribute == 'max') {
            return `<div *ngIf="${getField}!.errors?.maxlength">${objName.toUpperCase()} max must be ${this.parameters[0]}</div>`
        }
        if (this.attribute == 'email') {
            return `<div *ngIf="${getField}!.errors?.email">${objName.toUpperCase()} an valid Email</div>`;
        }
        
        return '';
    }

    private setRules(rules: Rules) {
        this.rules = ValidatorRuleHelper.splitRules(rules);
    }
    
}

class ReactiveDrivenValidator {

    attribute!: string;
    parameters?: any;
    rules!: any;
    getDefinitions: any = [];
    getters: any = [];
    _options: Options = {
        formName: 'form',
        triggerValidationOnSubmit: true,
        componentName: '',
        container: 'container'
    };
    componentName!: string;
    
    constructor(rules: any, componentName: string) {
        console.log('entrou');
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

        this.getters.forEach((item: any) => {
            if(item.get){
                item.get.forEach((currentGet: any) => {
                    definitions.push(currentGet.get_function);
                    definitions.push(currentGet.delete_function);
                    definitions.push(currentGet.create_function);
                })
            }
            if(item.mock_data){
                definitions.push([
                    `${item.mock_data.get_name}$(){`,
                    `return of(${JSON.stringify(item.mock_data.values)})`,
                    `.pipe(
                        delay(2000)
                    )`,
                    `}`
                ].join("\n"));
                initVariables.push(`${item.mock_data.parameter_name}$!: Observable<any>;`);
                initObservables.push(`${item.mock_data.parameter_name}$ = this.${item.mock_data.get_name}$();`);
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

                ${definitions.join("\n")}                
            `
        ];
        
        component.push("}");
        return component;
    }

    protected reactiveDrivenValidators(object: any, names: string = '', parameters: string[] = []): string {
        return Object.keys(object).map((key: any) => {
            let value = object[key];
            let rest = names.length ? '.' + key : key;
            let completeKeyName = (names + rest).split('.');
            let dot_notation = ValidatorRuleHelper.dotNotation(completeKeyName);
            let definition = null;
            let n = key.split('.');
            let firstNameBeforeDot = n[0];
            //value: can be an array ['required', 'min:40'] or an object {}
            let isValueAnArray = Array.isArray(value) ? true : false;

            //key has asterisk, so must turn into an array
            if (completeKeyName[completeKeyName.length - 1] == '*') {
                let index = 0;
                for (var i = completeKeyName.length - 1; i >= 0; i--) {
                    if (completeKeyName[i] != '*') {
                        break;
                    }
                    let rand = ValidatorRuleHelper.camelCasedString(n.join(""));
                    rand = `index${rand}${index == 0 ? '' : index}`;
                    parameters.push(rand);
                    index++;
                }
                let formBuilderGroup:any = [];

                //"key.*": ['required', 'min:10']
                if(isValueAnArray){
                    let rules = value;
                    let parameters = rules.reduce((parameters: string[], rule: any) => {
                        let parsed = ValidatorRuleHelper.parseStringRule(rule);
                        this.attribute = parsed[0];
                        this.parameters = parsed[1];
                        let attr_get = this.get();
                        if (attr_get != '') {
                            parameters.push(attr_get);
                        }

                        return parameters;
                    }, []);

                    formBuilderGroup = [`this.formBuilder.control('', [${parameters.join(",")}]);`];            
                } else { //"key.*": { "any: ['required', 'min:10']" }
                    formBuilderGroup = [
                        `this.formBuilder.group({`,
                        `${this.reactiveDrivenValidators(value, names + rest, parameters)}`,
                        `})`,
                    ];
                }

                definition = ValidatorDefinition.get({
                    completeKeyName: completeKeyName,
                    name: firstNameBeforeDot,
                    parameters: parameters,
                    formBuilderGroup: formBuilderGroup,
                    //isValueAnArray: isValueAnArray
                });

                this.getters.push(definition);
            }
            
            //key: { any: [], any2.*: [] }
            if (Object.prototype.toString.call(value) == '[object Object]') {
                //key has asterisk
                if (completeKeyName[completeKeyName.length - 1] == '*') {
                    parameters = ValidatorRuleHelper.removeParameters(n, parameters);

                    return [
                        `"${firstNameBeforeDot}":`,
                        definition.formBuilder.join("\n"),
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

            //key: ['max:40']
            if (Array.isArray(value)) {
                let rules = value;
                let ruleParameters = rules.reduce((parameters: string[], rule: any) => {
                    const parsed = ValidatorRuleHelper.parseStringRule(rule);
                    this.attribute = parsed[0];
                    this.parameters = parsed[1];
                    let attr_get = this.get();
                    if (attr_get != '') {
                        parameters.push(attr_get);
                    }

                    return parameters;
                }, []);
                let values = rules.reduce((accArr, rule) => {
                    let parsed = ValidatorRuleHelper.parseStringRule(rule);
                    if (parsed[0] == 'in') {
                        //accArr = parsed[1][0].split(",");
                        accArr = parsed[1];
                        console.log('parsed', parsed);
                    }

                    if(parsed[0] == 'html'){
                        if(['select', 'radio', 'checkbox'].includes(parsed[1][0])){
                            if(parsed[0] != 'in'){
                                accArr = [{
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
                        }
                    }

                    return accArr;
                }, []);

                if(values.length > 0){
                    this.getters.push({
                        mock_data: {
                            parameter_name: ValidatorRuleHelper.camelCasedString(dot_notation.join("."), true),
                            get_name: `get${ValidatorRuleHelper.camelCasedString(dot_notation.join("."))}`,
                            values: values
                        }
                    })
                }
                
                parameters = ValidatorRuleHelper.removeParameters(n, parameters);
        
                if(definition != null){ //key has asterisk
                    return `"${firstNameBeforeDot}": ${definition.formBuilder.join("\n")}`;
                }
                
                return `"${key}": ['', [${ruleParameters.join(",")}]],`
            }

            return '';
        }).join("\n");
    }

    private setRules(rules: Rules) {
        this.rules = ValidatorRuleHelper.splitRules(rules);
    }

    public get(): string {
        
        if (this.attribute == 'min') {
            return this.validateMin();
        }
        if (this.attribute == 'max') {
            return this.validateMax();
        }
        if (this.attribute == 'required') {
            return this.validateRequired();
        }
        if (this.attribute == 'email') {
            return this.validateEmail();
        }
        if (this.attribute == 'between_length') {
            return this.validateBetweenLength();
        }

        return '';
    }

    public validateBetweenLength() : string
    {
        return `ArrayValidators.betweenLength(${this.parameters[0]})`;
    }

    public validateMax() : string
    {
        return `Validators.maxLength(${this.parameters[0]})`;
    }

    public validateEmail() : string
    {
        return `Validators.email`;
    }
    
    public validateMin() : string
    {
        return `Validators.minLength(${this.parameters[0]})`;
    }
    
    public validateRequired() : string
    {
        return `Validators.required`;
    }
}

import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
    selector: 'app-json-to-form-form',
    templateUrl: './json-to-form-form.component.html',
    styleUrls: ['./json-to-form-form.component.css']
})
export class JsonToFormFormComponent implements OnInit {
    public editorOptions: JsonEditorOptions;
    @ViewChild(JsonEditorComponent, { static: false }) editor?: JsonEditorComponent;
    
    loading: boolean = false;
    formExample!: any;
    hoverEffect: {
        valid: string[],
        invalid: string[]
    } = {
        valid: [],
        invalid: []
    };
    formBuilder$!: Observable<any>
    form!: FormGroup;
    formSubmitAttempt: boolean = false;
    examples: {
        valid: {
            [key: string]: Object
        },
        invalid: {
            [key: string]: Object
        }
    } = {
        valid: {
            "users.*.*": {
                "users.*.*": {
                    first_name: "required|min:3|max:255",
                    last_name: "required|min:3|max:255"
                },                
            }
        },
        invalid: {
            "users.*.id": {
                "users.*.id": {
                    first_name: "required|min:3|max:255",
                    last_name: "required|min:3|max:255"
                },                
            },
            ".*users": {
                ".*users": {
                    first_name: "required|min:3|max:255",
                    last_name: "required|min:3|max:255"
                },                
            },
            "  users ": {
                "  users ": {
                    first_name: "required|min:3|max:255",
                    last_name: "required|min:3|max:255"
                },                
            }
        }
    };

    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    isLoadingAction$ = this.isLoadingSubject.asObservable();

    constructor(
        private formBuilder: FormBuilder,
        private jsonToFormExampleService: JsonToFormExampleService,
        private route: ActivatedRoute
    ) {
        this.editorOptions = new JsonEditorOptions();
        this.editorOptions.mode = 'code'; // set all allowed modes
        this.editorOptions.modes = ['code']; // set all allowed modes

     
    }

    ngAfterViewInit(){
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.formExample = this.jsonToFormExampleService.getExampleByNumber(params.id) == null
                ? {}
                : this.jsonToFormExampleService.getExampleByNumber(params.id).data;
        });

        this.form = this.formBuilder.group({
            "json": [
                this.formExample,
                [
                    //JsonValidators.startsWithCurlyBrackets(),
                    JsonValidators.validateObject()
                ]
            ],
            "componentName": [
                'test-form', 
                [
                    Validators.required,
                    Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
                ]
            ],
            //"options": ['', [Validators.required]],
        });
        this.form.markAllAsTouched();
      
        this.formBuilder$ = this.form.valueChanges
            .pipe(
                tap(() => this.isLoadingSubject.next(true)),
                startWith(
                    this.form.value
                ),
                tap(value => {
                    if(!this.form.valid){
                        this.isLoadingSubject.next(false);
                    }
                    console.log('value');
                }),
                debounceTime(800),
                distinctUntilChanged((a, b) => {
                    if(JSON.stringify(a) === JSON.stringify(b)){
                        this.isLoadingSubject.next(false);
                        return true;
                    }
                    return false;
                }),
                switchMap(value => {
                    if(this.form.valid){
                        const json = value.json;
                        const component = (new ReactiveDrivenValidator(json, value.componentName))
                            .generateComponent();
                        const html = (new ReactiveDrivenHtml(json))
                            .generate();
                        
                        return of({
                            component: js_beautify(component.join("\n")),
                            html: html_beautify(html.join("\n"))
                        });
                    }
                    
                    return of({});
                }),
                tap(() => this.isLoadingSubject.next(false))
            );
    }

    copy(text: string){
        alert('still working on it!')
    }

    onSubmit(): void {
        this.formSubmitAttempt = true;

        if (this.f.valid) {
        } else {
            this.validateAllFormFields(this.f);
        }
    }

    validateAllFormFields(control: AbstractControl) {
        if (control instanceof FormControl) {
            control.markAsTouched({
                onlySelf: true
            });
        } else if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach((field: string) => {
                const groupControl = control.get(field) !;
                this.validateAllFormFields(groupControl);
            });
        } else if (control instanceof FormArray) {
            const controlAsFormArray = control as FormArray;
            controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
        }
    }

    get f() {
        return this.form;
    }

    isFieldValid(field: string) {
        return !this.f.get(field)?.valid && this.f.get(field)?.touched;
    }

    getField(field: string) {
        return this.f.get(field);
    }

}