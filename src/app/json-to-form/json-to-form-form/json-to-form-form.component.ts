import { LoadingService } from './../../shared/services/loading.service';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormControl, AbstractControl, FormGroup, FormBuilder, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { js_beautify, html_beautify } from 'js-beautify';
import { JsonToFormService } from './../../services/json-to-form.service';

class JsonValidators {
    static minLengthArray(min: number) {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value.length >= min)
                return null;
    
            return { 'minLengthArray': {valid: false }};
        }
    }
    
    static validateObject(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const error: ValidationErrors = { 
                invalidJson: true
            };

            let object = control.value;
            if(typeof control.value == 'string'){
                object = JSON.parse(control.value);
            }

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

import { debounceTime, distinctUntilChanged, filter, finalize, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable, of, merge, zip } from 'rxjs';

import { ValidatorRuleHelper } from 'src/app/services/angular/validator-rule-helper';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
@Component({
    selector: 'app-json-to-form-form',
    templateUrl: './json-to-form-form.component.html',
    styleUrls: ['./json-to-form-form.component.scss']
})
export class JsonToFormFormComponent implements OnInit {
    formExample!: any;
    form!: FormGroup;
    /*hoverEffect: {
        valid: string[],
        invalid: string[]
    } = {
        valid: [],
        invalid: []
    };
    examples: {
        valid: {
            [key: string]: Object
        },
        invalid: {
            [key: string]: Object
        }
    };*/
    childComponents: FormControl = new FormControl('', []);
    editorOptions: JsonEditorOptions;
    formBuilder$!: Observable<any>;
    isLoadingAction$?: Observable<boolean>;

    @ViewChild(JsonEditorComponent, { static: false }) editor?: JsonEditorComponent;
    constructor(
        private formBuilder: FormBuilder,
        private jsonToFormService: JsonToFormService,
        private route: ActivatedRoute,
        private loadingService: LoadingService
    ) {
        //this.examples = this.jsonToFormService.getValidInvalid();
        this.editorOptions = new JsonEditorOptions();
        this.editorOptions.mode = 'code'; // set all allowed modes
        this.editorOptions.modes = ['code']; // set all allowed modes
        this.isLoadingAction$ = this.loadingService.isLoadingAction$;
    }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map(paramMap => paramMap.get('id')),
                filter(id => id != null),
                switchMap(id => {
                    return this.jsonToFormService.getExampleByNumber(Number(id))
                })
            )
            .subscribe(result => {
                this.formExample = result == null ? {} : result.data;
            });

        this.form = this.formBuilder.group({
            json: [
                this.formExample,
                [
                    JsonValidators.validateObject()
                ]
            ],
            component_form: this.formBuilder.control('', Validators.required),
            component: this.formBuilder.group({
                name: ['task', [
                    Validators.required,
                    Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
                ]],
                children: this.formBuilder.array([
                    this.createComponentChildren('form'),
                    this.createComponentChildren('create-edit'),
                    this.createComponentChildren('show'),
                    this.createComponentChildren('table')
                ], [
                    JsonValidators.minLengthArray(1)
                ]),
            }),
            options: this.formBuilder.group({
                convert_to: [
                    'angular', 
                    [Validators.required]
                ]
            })
        });
        this.form.markAllAsTouched();
        let componentName: string[] = [];
        this.getComponentChildren().value.forEach((item: any) => {
            componentName.push(item.name);
        });
        this.childComponents.patchValue(componentName.join("\n"));
        this.onValueChanges();
    }

    onValueChanges(){

        this.form.get('component.name')?.valueChanges
            .pipe(
                map(value => {
                    return value.trim();
                })
            ).subscribe(value => {
                this.form.get('component.name')?.setValue(value, {
                    emitEvent: false
                });
            })


        this.childComponents.valueChanges
            .pipe(
                //filter(el => el.length > 0),
                distinctUntilChanged(),
                map(value => {
                    return value.split('\n');
                }),
                map((valueArr: any) => {
                    return valueArr.filter((el: any) => el);
                })
            ).subscribe(result => {
                this.getComponentChildren().clear();
                result.forEach((component: string) => {
                    this.getComponentChildren().push(
                        this.createComponentChildren(component)
                    );
                });
            });

 
        this.formBuilder$ = this.form.valueChanges
            .pipe(
                tap(() => {
                    this.loadingService.isLoading(true)
                }),
                startWith(
                    this.form.value
                ),
                tap((result) => {
                    if(!this.form.valid){
                        this.loadingService.isLoading(false);
                    }
                }),
                debounceTime(500),
                distinctUntilChanged((a, b) => {
                    if(JSON.stringify(a) === JSON.stringify(b)){
                        this.loadingService.isLoading(false);
                        return true;
                    }
                    return false;
                }),
                tap(() => {
                }),
                switchMap(value => {
                    if(this.form.valid){
                        const json = typeof value.json === 'string'
                            ? JSON.parse(value.json)
                            : value.json;
                        //const componentName = value.component.name;
                        const componentName = value.component_form;

                        console.log('componentName', componentName);
                        
                        const reactiveDrivenHtml = new ReactiveDrivenHtml(json);
                        const reactiveDrivenValidator = new ReactiveDrivenValidator(json, componentName);
                        const component = reactiveDrivenValidator.generateComponent();
                        const html = reactiveDrivenHtml.generate();
                        
                        return of({
                            component: js_beautify(component.join("\n")),
                            html: html_beautify(html.join("\n"))
                        });
                    }
                    
                    return of({});
                }),
                tap(() => this.loadingService.isLoading(false))
            );

            merge(
                this.form.get('component.children')!.valueChanges,
                this.form.get('component.name')!.valueChanges
            )
            .pipe(
                tap(() => {
                    this.form.get('component_form')!.patchValue('', {
                        emitEvent: false
                    })
                })
            ).subscribe();
    }

    copy(text: string){
        alert('still working on it!')
    }

    onSubmit(): void {
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

    getComponentChildren(): FormArray {
        return this.form.get('component.children') as FormArray;
    }

    deleteComponentChildren(indexChildren: number): void {
        this.getComponentChildren().removeAt(indexChildren);
    }

    createComponentChildren(name?: string) {
        return this.formBuilder.group({
            "name": [name, [Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)]],
        });
    }    

    isFieldValid(field: string) {
        return !this.f.get(field)?.valid && this.f.get(field)?.touched;
    }

    getField(field: string) {
        return this.f.get(field);
    }

}